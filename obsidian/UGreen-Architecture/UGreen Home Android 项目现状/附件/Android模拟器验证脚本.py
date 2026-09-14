from pathlib import Path
import subprocess, os, socket, time, json, re

R = Path(__file__).parent
SDK = '/Users/daubert/Library/Android/sdk'
PORT, EP = 5052, 5584
SERIAL = f'emulator-{EP}'
env = dict(os.environ, ANDROID_HOME=SDK, ANDROID_SDK_ROOT=SDK,
           ANDROID_AVD_HOME=str(R/'avd'), ANDROID_USER_HOME=str(R/'user'),
           ANDROID_ADB_SERVER_PORT=str(PORT), ADB_SERVER_SOCKET=f'tcp:localhost:{PORT}')
adb = [SDK+'/platform-tools/adb', '-P', str(PORT)]
result = {'serial': SERIAL, 'adbPort': PORT, 'avd': 'UGreenSurveyApi36', 'api': 36, 'steps': []}

def run(name, args, timeout=60, check=True):
    q = subprocess.run(adb+['-s', SERIAL]+args, env=env, capture_output=True, text=True, timeout=timeout)
    (R/(name+'.txt')).write_text(q.stdout+'\n'+q.stderr)
    result['steps'].append({'name': name, 'exit': q.returncode, 'evidence': name+'.txt'})
    if check and q.returncode:
        raise RuntimeError(name+': '+q.stderr[:1000])
    return q.stdout

for p in (PORT, EP, EP+1):
    with socket.socket() as s:
        s.bind(('127.0.0.1', p))
subprocess.run(adb+['start-server'], env=env, check=True, capture_output=True)
cmd = [SDK+'/emulator/emulator', '-avd', 'UGreenSurveyApi36', '-port', str(EP),
       '-no-window', '-no-audio', '-no-snapshot', '-no-boot-anim', '-gpu',
       'swiftshader_indirect', '-memory', '2048', '-cores', '2', '-dns-server', '127.0.0.1']
result['command'] = cmd
start = time.monotonic()
with (R/'runtime-emulator.log').open('w') as log:
    proc = subprocess.Popen(cmd, env=env, stdout=log, stderr=subprocess.STDOUT)
    try:
        while time.monotonic()-start < 180 and proc.poll() is None:
            time.sleep(2)
            q = subprocess.run(adb+['-s', SERIAL, 'shell', 'getprop', 'sys.boot_completed'],
                               env=env, capture_output=True, text=True, timeout=10)
            if q.stdout.strip() == '1':
                break
        else:
            raise RuntimeError('boot timeout or emulator exit')
        result['bootSeconds'] = round(time.monotonic()-start, 2)
        assert run('avd-identity', ['emu', 'avd', 'name']).splitlines()[0] == 'UGreenSurveyApi36'
        run('airplane', ['shell', 'cmd', 'connectivity', 'airplane-mode', 'enable'])
        run('wifi-off', ['shell', 'svc', 'wifi', 'disable'])
        run('data-off', ['shell', 'svc', 'data', 'disable'])
        time.sleep(3)
        assert run('airplane-state', ['shell', 'settings', 'get', 'global', 'airplane_mode_on']).strip() == '1'
        connectivity = run('runtime-connectivity', ['shell', 'dumpsys', 'connectivity'])
        if not re.search(r'Active default network:\s*(?:none|null)', connectivity):
            raise RuntimeError('no-network assertion failed; do not install or launch')
        result['offlineVerified'] = True
        for name in ('app', 'test'):
            out = run('install-'+name, ['install', '-r', str(R/(name+'.apk'))], timeout=150)
            assert 'Success' in out
        run('clear-logcat', ['logcat', '-c'])
        output = run('instrumentation-all', ['shell', 'am', 'instrument', '-w', '-r',
                     'com.ugreen.home.test/androidx.test.runner.AndroidJUnitRunner'], timeout=240, check=False)
        result['instrumentation'] = {'okSummary': re.findall(r'OK \(\d+ tests?\)', output),
                                     'statusCodes': re.findall(r'INSTRUMENTATION_STATUS_CODE: (-?\d+)', output),
                                     'finalCodes': re.findall(r'INSTRUMENTATION_CODE: (-?\d+)', output),
                                     'failureSummary': re.findall(r'Tests run:.*', output)}
        run('instrumentation-logcat', ['logcat', '-d', '-v', 'threadtime'], check=False)
        run('force-stop', ['shell', 'am', 'force-stop', 'com.ugreen.home'])
        component = run('launcher-component', ['shell', 'cmd', 'package', 'resolve-activity', '--brief',
                         '-a', 'android.intent.action.MAIN', '-c', 'android.intent.category.LAUNCHER', 'com.ugreen.home']).strip().splitlines()[-1]
        assert component.startswith('com.ugreen.home/')
        result['launchOutput'] = run('launch-smoke', ['shell', 'am', 'start', '-W', '-n', component], check=False)
        time.sleep(10)
        run('activity-smoke', ['shell', 'dumpsys', 'activity', 'activities'])
        run('ui-dump', ['shell', 'uiautomator', 'dump', '/sdcard/window.xml'], check=False)
        run('ui-xml', ['shell', 'cat', '/sdcard/window.xml'], check=False)
        pic = subprocess.run(adb+['-s', SERIAL, 'exec-out', 'screencap', '-p'], env=env, capture_output=True, timeout=30)
        if pic.returncode == 0 and pic.stdout.startswith(b'\x89PNG'):
            (R/'launch-smoke.png').write_bytes(pic.stdout)
            result['screenshot'] = 'launch-smoke.png'
        run('smoke-logcat', ['logcat', '-d', '-v', 'threadtime'], check=False)
        result['completed'] = True
    except Exception as e:
        result['error'] = str(e)
    finally:
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=15)
            except subprocess.TimeoutExpired:
                proc.kill(); proc.wait(timeout=10)
        q = subprocess.run(adb+['kill-server'], env=env, capture_output=True)
        result['cleanup'] = {'emulatorExit': proc.poll(), 'adbServerStopExit': q.returncode}
        result['totalSeconds'] = round(time.monotonic()-start, 2)
        (R/'runtime-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
        print(json.dumps(result, ensure_ascii=False))
