
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


listenForClicks()
