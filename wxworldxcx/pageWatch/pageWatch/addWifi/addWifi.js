var util = require('../../../utils/util.js');
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPass:1,
    acc:'',
    pass:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //公用设置参数
		app.commonInit(options, this, function(tokenInfo) {

    })
  },
  accInput(e){
    this.setData({
      acc:e.detail.value,
      check:(this.data.acc!='' && this.data.isPass==0 ? 1 : 0),
    })
  },
  passInput(e){
    this.setData({
      pass:e.detail.value,
      check:(this.data.acc!='' && e.detail.value!='' ? 1 : 0),
    })
  },
  isPass(){
    if(this.data.isPass==0){
      this.setData({
        isPass:1,
        check:(this.data.acc!='' && this.data.pass!='' ? 1 : 0),
      })
    }else{
      this.setData({
        isPass:0,
        check:(this.data.acc!='' ? 1 : 0),
      })
    }

  },

  goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
		})
	},
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})