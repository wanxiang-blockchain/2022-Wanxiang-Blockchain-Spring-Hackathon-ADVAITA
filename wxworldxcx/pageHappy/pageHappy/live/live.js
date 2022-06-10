var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		URL: 4,
		isScroll:0
	},
	onLoad: function(options) {
		var that = this;
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pages/personal/personal'
		})
	},
	searchScrollLower(){
		this.setData({
			isScroll:this.data.isScroll+1
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'live/live');
		data.share_true_url = data.share_true_url.replace('pages', 'pageHappy');
		console.log(data.share_true_url);
		return {
			// title: tokenInfo.shareAgencyPoster.share_title,
			// imageUrl: tokenInfo.shareAgencyPoster.share_image_url,
			path: data.share_true_url,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})

