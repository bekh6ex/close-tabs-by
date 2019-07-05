let closeWithSameDomainMenuItemId = 'close-tabs-with-same-domain'
let closeWithSame2ndLevelDomainMenuItemId = 'close-tabs-with-same-2nd-level-domain'

const TAB_SUBSET = {currentWindow: true, pinned: false}


browser.contextMenus.create({
  id: closeWithSameDomainMenuItemId,
  title: 'Close tabs with the same domain',
  contexts: ['tab']
})

browser.contextMenus.create({
  id: closeWithSame2ndLevelDomainMenuItemId,
  title: 'Close tabs with the same 2-nd level domain',
  contexts: ['tab']
})

async function closeTabsWithTheSameDomain (tab) {
  const domain = extractDomain(tab.url)
  if (!domain) {
    return
  }

  const allTabs = await browser.tabs.query(TAB_SUBSET)

  const tabsToClose = allTabs
      .filter(t => !t.pinned)
      .filter(t => extractDomain(t.url) === domain)

  tabsToClose.forEach(t => console.log(t.title))

  browser.tabs.remove(tabsToClose.map(t => t.id))
}

function domainTo2ndLevelDomain (domain) {
  return domain.split('.').slice(-2).join('.')
}

async function closeTabsWithTheSame2ndLevelDomain (tab) {
  const domain = extractDomain(tab.url)
  if (!domain) {
    return
  }
  const domain2lvl = domainTo2ndLevelDomain(domain)

  const allTabs = await browser.tabs.query(TAB_SUBSET)

  const tabsToClose = allTabs.filter(t => {
    let tabDomain = extractDomain(t.url)
    if (!tabDomain) {
      return false
    }
    return domainTo2ndLevelDomain(tabDomain) === domain2lvl
  })

  tabsToClose.forEach(t => console.debug(t.title))

  browser.tabs.remove(tabsToClose.map(t => t.id))
}

function closeTabsByTitleContaining (needle) {
  const allTabs = browser.tabs.query(TAB_SUBSET)

  allTabs.then(function (allTabs) {

    const tabsToClose = allTabs.filter(function (t) {
      return t.title.toLowerCase().indexOf(needle.toLowerCase()) !== -1
    })


    browser.tabs.remove(tabsToClose.map(t => t.id))
  })

}

function extractDomain (url) {
  try {
    return new URL(url).host
  } catch (e) {
    return
  }
}

browser.menus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case closeWithSameDomainMenuItemId:
      closeTabsWithTheSameDomain(tab)
      break
    case closeWithSame2ndLevelDomainMenuItemId:
      closeTabsWithTheSame2ndLevelDomain(tab)
      break
  }
})

browser.menus.onShown.addListener(async function (info, tab) {
  const domain = extractDomain(tab.url) || 'not-applicable.O_o'
  if (!domain) {
    return
  }

  if (info.menuIds.indexOf(closeWithSameDomainMenuItemId) >= 0) {
    browser.menus.update(closeWithSameDomainMenuItemId, {
      title: `domain: ${domain}`,
      enabled: true
    })
  }

  if (info.menuIds.indexOf(closeWithSame2ndLevelDomainMenuItemId) >= 0) {
    const domain2lvl = domainTo2ndLevelDomain(domain)
    browser.menus.update(closeWithSame2ndLevelDomainMenuItemId, {
      title: `domain: *.${domain2lvl}`,
      enabled: true
    })
  }

  browser.menus.refresh()

})

