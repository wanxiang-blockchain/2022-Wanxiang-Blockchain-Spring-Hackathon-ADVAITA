// components/scroll-number/index.js
Component({
  externalClasses: ['container-class', 'item-class', 'dot-class'],
  properties: {
    value: {
      type: String,
      value: ''
    },
    /** 一次滚动耗时 单位ms */
    duration: {
      type: Number,
      value: 1600
    },
    /** 每个数字之间的延迟滚动 */
    delay: {
      type: Number,
      value: 200
    }
  },
  data: {
    valArr: [],
    aniArr: [],  // 动画列表，和valArr对应
    numArr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],  // 所有数字
    itemHeight: 0  // 数字项的高度
  },
  observers: {
    value: function (newVal) {
      // 监听value变化，格式化为valArr
      let valArr = []
      if (newVal) {
        valArr = newVal.split('').map(o => {
          return { val: o, isNaN: isNaN(o)}
        })
      }
      this.setData({
        valArr: valArr
      })
      this.getNumberHeight()
    }
  },
  methods: {
    /** 计算数字高度 */
    getNumberHeight() {
      if (this.data.itemHeight > 0) {
        this.startScrollAni()
        return
      }
      const query = this.createSelectorQuery()
      query.select('.number-item').boundingClientRect()
      query.exec((res) => {
        this.setData({
          itemHeight: res[0].height
        })
        this.startScrollAni()
      })
    },
    /** 开始滚动动画 */
    startScrollAni() {
      if (this.data.itemHeight <= 0) return

      const aniArr = []
      this.data.valArr.forEach((item, index) => {
        if(!item.isNaN) {
          aniArr.push(`transition-delay: ${this.data.delay * index}ms; top: ${-this.data.itemHeight * (this.data.numArr[parseInt(item.val)])}px;`)
        } else {
          aniArr.push(null)
        }
      })
      this.setData({
        aniArr: aniArr
      })
    }
  }
})
