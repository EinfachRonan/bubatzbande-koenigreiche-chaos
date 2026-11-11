"""Lädt ./site per SFTP auf STRATO hoch (wie lftp mirror -R --delete).
Geänderte Dateien (andere Größe oder neuer) werden hochgeladen, entfernte gelöscht.
rooms/ und data/ auf dem Server bleiben unangetastet."""
import os, sys, stat, posixpath, paramiko

host = os.environ['STRATO_HOST']; user = os.environ['STRATO_USER']; pw = os.environ['STRATO_PASSWORD']
port = int(os.environ.get('STRATO_PORT') or 22)
root = os.environ.get('STRATO_PATH') or '/'
if root in ('', '.'): root = '/'
if not root.startswith('/'): root = '/' + root
SKIP = {'rooms', 'data'}
LOCAL = 'site'

t = paramiko.Transport((host, port)); t.connect(username=user, password=pw)
sf = paramiko.SFTPClient.from_transport(t)
up = dl = 0

def rlist(path):
    try: return {a.filename: a for a in sf.listdir_attr(path)}
    except IOError: return None

def sync(lp, rp):
    global up, dl
    remote = rlist(rp)
    if remote is None: sf.mkdir(rp); remote = {}
    local = set(os.listdir(lp))
    for name in sorted(local):
        l, r = os.path.join(lp, name), posixpath.join(rp, name)
        if os.path.isdir(l):
            if name in SKIP: continue
            sync(l, r)
        else:
            st = os.stat(l); a = remote.get(name)
            if a is None or a.st_size != st.st_size or (a.st_mtime or 0) < int(st.st_mtime):
                sf.put(l, r); up += 1; print('hoch', r)
    for name, a in remote.items():
        if name in local or name in SKIP: continue
        r = posixpath.join(rp, name)
        if stat.S_ISDIR(a.st_mode): rmtree(r)
        else: sf.remove(r)
        dl += 1; print('weg', r)

def rmtree(p):
    for a in sf.listdir_attr(p):
        q = posixpath.join(p, a.filename)
        rmtree(q) if stat.S_ISDIR(a.st_mode) else sf.remove(q)
    sf.rmdir(p)

sync(LOCAL, root.rstrip('/') or '/')
print(f'fertig: {up} hochgeladen, {dl} gelöscht')
sf.close(); t.close()
