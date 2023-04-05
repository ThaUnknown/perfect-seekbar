/* eslint-disable no-new */
/* eslint-disable no-undef */
import App from '../src/perfect-seekbar.svelte'

const app = new App({
  target: test1,
  props: {
    buffer: 35
  }
})
new App({
  target: test2,
  props: {
    buffer: 35,
    length: 2400.235,
    accentColor: '#00f'
  }
})
new App({
  target: test3,
  props: {
    buffer: 35,
    length: 2400.235,
    accentColor: 'orange',
    chapters: [
      {
        size: 10
      },
      {
        size: 15
      },
      {
        size: 25
      },
      {
        size: 25
      },
      {
        size: 15
      },
      {
        size: 10
      }
    ]
  }
})
new App({
  target: test4,
  props: {
    buffer: 35,
    getThumbnail: () => 'https://www.hollywoodreporter.com/wp-content/uploads/2022/11/Puss-in-Boots-The-Last-Wish-Everett-H-2022.jpg',
    length: 2400.235,
    chapters: [
      {
        text: 'Recap',
        size: 10
      },
      {
        text: 'Opening',
        size: 15
      },
      {
        text: 'Part A',
        size: 25
      },
      {
        text: 'Part B',
        size: 25
      },
      {
        text: 'Ending',
        size: 15
      },
      {
        text: 'Preview',
        size: 10
      }
    ]
  }
})

navigator.serviceWorker.register('./sw.js')

export default app
