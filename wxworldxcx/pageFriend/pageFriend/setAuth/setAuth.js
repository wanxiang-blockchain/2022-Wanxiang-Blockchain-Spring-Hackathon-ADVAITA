var util = require('../../../utils/util.js');
var app = getApp();
Page({
  data: {
	  type:1
  },
  onLoad: function (options) {
    var that = this
    //公用设置参数
    app.commonInit(options,this,function(tokenInfo){
		that.setData({
			type: that.data._GET.type || "1",
			id: that.data._GET.id || ""
		})
    });//end 公用设置参数
  },
  back(e){
	  wx[e.detail]({
	      url: '/pageFriend/pageFriend/userDetail/userDetail'
	  })
  },
  authChange(e){
	  var that = this;
	  let type = e.target.dataset.type || e.currentTarget.dataset.type
	  util.ajax({
	      url: util.config('baseApiUrl') + 'Api/Exercise/treportSetUserAuth',
	      data: {
	          user_id: wx.getStorageSync('user_id'),
			  shop_id: wx.getStorageSync('watch_shop_id'),
			  bind_treport_user_table_id:that.data.id,
	          look_treport_auth: type || 1
	      },
	      success: function(ress) {
	          if (ress.error == 0) {
				wx.showToast({
					title: '设置成功',
					icon: 'none',
					duration: 2000
				});
				that.setData({
				    type: type
				})
	          }else{
				wx.showToast({
					title: ress.msg,
					icon: 'none',
					duration: 1000
				});
	  		}
	      }
	  })
  }
})