
console.log('popup')

let form = document.getElementById('the-form')

function listenForClicks() {
  document.addEventListener('submit', (e) => {
    /**
     * Get the active tab,
     * then call "beastify()" or "reset()" as appropriate.
     */
    let input = e.target.getElementsByTagName('input')[0]
    let value = input.value.trim()
    console.debug(value)
    if (!value) {
      return
    }
    browser.extension.getBackgroundPage().closeTabsByTitleContaining(value)
  })
}

function toSortedList(byUrl) {
  const allList = []
  for (const [path, tabs] of Object.entries(byUrl)) {

    allList.push({
      path,
      tabs
    })
  }

  allList.sort((a, b) => {
    const tabNumberDiff = b.tabs.length - a.tabs.length;
    if (tabNumberDiff === 0) {
      return b.path.length - a.path.length
    } else {
      return tabNumberDiff
    }
  })
  return allList;
}

async function initTopTabList() {
  const TAB_SUBSET = {currentWindow: true, pinned: false}
  const allTabs = await browser.tabs.query(TAB_SUBSET)
  const notPinnedTabs = allTabs
    .filter(t => !t.pinned)


  const byUrl = {}
  const byDomain = {}

  const add = (prefix, tab) => {
    if (!byUrl[prefix]) {
      byUrl[prefix] = []
    }

    byUrl[prefix].push(tab)
  }
  const addByDomain = (domain, tab) => {
    if (!byDomain[domain]) {
      byDomain[domain] = []
    }

    byDomain[domain].push(tab)
  }

  notPinnedTabs.forEach((t) => {
    try {
      const url = new URL(t.url)

      const pathSegments = url.pathname.split('/').filter(Boolean);

      let path = url.host
      for (const pathSegment of pathSegments) {
        path += "/" + pathSegment
        add(path, t)
      }

      addByDomain(url.host, t)

      const domainParts = url.host.split('.')
      domainParts.shift()
      while (domainParts.length > 1) {
        addByDomain("*." + domainParts.join('.'), t)
        domainParts.shift()
      }

    } catch (e) {
      return
    }
  })

  for (const [url, tabs] of Object.entries(byUrl)) {
    for (const [otherUrl, otherTabs] of Object.entries(byUrl)) {
      if (url === otherUrl) {
        continue
      }
      if (otherUrl.startsWith(url)) {
        if (tabs.length === otherTabs.length) {
          delete byUrl[url]
        }
      }
    }
  }
  const allList = toSortedList(byUrl);
  const domainList = toSortedList(byDomain)

  const top20 = allList.slice(0, 20);

  renderTop(top20, 'Top by path')
  renderTop(domainList, 'By domain')
  notPinnedTabs.forEach(t => console.log(t.title))

}


function renderTop(topList = [], headerText) {
  const container = document.getElementById('top-tabs-container');
  container.childNodes.forEach(n => n.remove())
  const header = document.createElement('h2');
  header.innerText = headerText
  container.append(header)

  for (const el of topList) {
    const htmlDivElement = document.createElement('div');
    htmlDivElement.innerText = `${el.path} (${el.tabs.length})`
    const closeButton = document.createElement('button');
    closeButton.type = "button"
    closeButton.innerHTML = "&times;"
    closeButton.onclick = (e) => {
      htmlDivElement.remove()
      browser.tabs.remove(el.tabs.map(t => t.id))
    }
    htmlDivElement.append(closeButton)
    container.append(htmlDivElement)
  }
}

initTopTabList()
listenForClicks()
