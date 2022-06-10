var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
	},
	onLoad: function(options) {
		var that = this
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			
		}); //end 公用设置参数
	},
	onShow() {
		
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/index/index'
		})
	},

	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		
		var data = app.shareInit('pageWatch', 'share/share');
		data.share_true_url = data.share_true_url.replace('pages', 'pageWatch');
		console.log(data.share_true_url);
		return {
			path: data.share_true_url,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
});
