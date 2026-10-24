"""Create display-size images without modifying portfolio originals (macOS sips)."""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / 'index.html'

def properties(path):
    result = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', '-g', 'hasAlpha', str(path)], text=True)
    return int(re.search(r'pixelWidth: (\d+)', result)[1]), int(re.search(r'pixelHeight: (\d+)', result)[1]), 'hasAlpha: yes' in result

html = HTML.read_text()
output = ROOT / 'assets' / 'optimized'
output.mkdir(exist_ok=True)
before = after = 0

def optimize(match):
    global before, after
    tag = match[0]
    src = re.search(r'src="([^"]+)"', tag)[1]
    original = ROOT / src
    if original.suffix.lower() not in {'.png', '.jpg', '.jpeg'} or 'optimized/' in src:
        return tag
    width, height, alpha = properties(original)
    limit = 1600 if 'photos /' in src else 600
    if 'skill-icon' in tag or 'favicon' in src or 'fog laptop' in src or 'call img' in src:
        limit = 240
    target = output / (original.stem + ('.png' if alpha else '.jpg'))
    args = ['sips', '-Z', str(min(limit, max(width, height)))]
    if not alpha: args += ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82']
    subprocess.run(args + [str(original), '--out', str(target)], check=True, stdout=subprocess.DEVNULL)
    if target.stat().st_size >= original.stat().st_size:
        target.unlink()
        target = original
    relative = target.relative_to(ROOT).as_posix()
    before += original.stat().st_size
    after += target.stat().st_size
    tag = tag.replace('src="' + src + '"', 'src="' + relative + '"')
    w, h, _ = properties(target)
    tag = re.sub(r'\s+(?:width|height|loading|decoding)="[^"]*"', '', tag)
    return tag[:-1].rstrip() + f' width="{w}" height="{h}" loading="lazy" decoding="async">'

html = re.sub(r'<img\b[^>]*>', optimize, html)
HTML.write_text(html)
print(f'Display images: {before:,} -> {after:,} bytes ({(1-after/before)*100:.1f}% smaller)' if before else 'Display images already optimized.')
