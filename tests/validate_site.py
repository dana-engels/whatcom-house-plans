"""Validate local references and metadata without fetching third-party URLs."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.path = path
        self.feed(path.read_text())

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'{self.path}: duplicate id'
            self.ids.add(attrs['id'])
        for key in ('src', 'href', 'aria-controls'):
            if attrs.get(key):
                self.references.append((key, attrs[key]))
        if tag == 'img':
            assert 'alt' in attrs, f'{self.path}: image missing alt'


def main():
    paths = [ROOT / 'index.html', ROOT / 'stock-plans-1/index.html', ROOT / '404.html']
    pages = {path: Page(path) for path in paths}
    count = 0
    for path, page in pages.items():
        for kind, raw in page.references:
            if kind == 'aria-controls':
                assert raw in page.ids, f'{path}: missing controlled element {raw}'
                continue
            url = urlsplit(raw)
            if url.scheme or url.netloc:
                continue
            target = (ROOT / unquote(url.path).lstrip('/')) if url.path.startswith('/') else path.parent / unquote(url.path)
            if not url.path:
                target = path
            target = target.resolve()
            if target.is_dir():
                target /= 'index.html'
            assert target.is_relative_to(ROOT), f'{path}: reference outside site'
            assert target.exists(), f'{path}: missing target {raw}'
            if url.fragment:
                assert target in pages and unquote(url.fragment) in pages[target].ids, f'{path}: missing fragment {raw}'
            count += 1
    for raw in re.findall(r'url\(["\']?([^"\')]+)', (ROOT / 'styles.css').read_text()):
        assert (ROOT / raw).is_file(), f'Missing CSS asset {raw}'
    sitemap = ET.parse(ROOT / 'sitemap.xml')
    locations = [element.text for element in sitemap.findall('.//{*}loc')]
    assert locations == ['https://www.whatcomhp.com/', 'https://www.whatcomhp.com/stock-plans-1']
    assert 'https://www.whatcomhp.com/sitemap.xml' in (ROOT / 'robots.txt').read_text()
    for line in (ROOT / '_redirects').read_text().splitlines():
        if line.strip() and not line.startswith('#'):
            source, destination, code = line.split()
            assert code == '301' and source.startswith('/')
            target = ROOT / destination.lstrip('/')
            assert target.is_dir() or target.is_file(), f'Missing redirect destination {destination}'
    print(f'Validated {len(pages)} pages, {count} local references, CSS assets, sitemap and redirect targets.')


if __name__ == '__main__':
    main()
