var util = require('../../utils/util.js');
const skinBehavior = require('../../utils/skinBehavior.js');
var app = getApp()

Page({
	behaviors: [skinBehavior],
	data: {
		URL: 4,
		task: [],
		total: 0,
		todayScore: 0,
		showReport: false,
		showSport:false,
		isLoading:false,
		step_num:0
	},

	onLoad: function(options) {
		var that = this;
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			// that.getData();
		})
	},
	goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-07-28/10:21:14/6100bf1a0aadc.png']
		})
		// wx.previewImage({
		//    current: 'https://i.2fei2.com/goods/logo/2021-06-11/14:43:05/60c305f948e52.png',
		//    urls: ['https://i.2fei2.com/goods/logo/2021-06-11/14:43:05/60c305f948e52.png']
		// })
		// wx.previewImage({
		//    current: 'https://i.2fei2.com/goods/logo/2021-07-15/11:56:47/60efb1ff4c213.png',
		//    urls: ['https://i.2fei2.com/goods/logo/2021-07-15/11:56:47/60efb1ff4c213.png']
		// })
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	goDetail(e) {
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		let count = e.target.dataset.count || e.currentTarget.dataset.count
		let can = e.target.dataset.can || e.currentTarget.dataset.can
		if (type == 27) {
			// 报告
			if(can == 0){
				this.setData({
					showReport: true
				})
			}
		} else if (type == 28) {
			// 早冥想
			wx.navigateTo({
				url: '/pageHappy/pageHappy/meditation/meditation'
			});
		} else if (type == 29) {
			// 晚冥想
			wx.navigateTo({
				url: '/pageHappy/pageHappy/meditation/meditation'
			});
		} else if (type == 30) {
			// 持戒精进
			// wx.navigateTo({
			// 	url: '/pageHappy/pageHappy/guideList/guideList'
			// });
		} else if (type == 31) {
			// 邀请好友
		} else if (type == 32) {
			// 每日运动
			if(count == 0){
				this.getSport()
			}
		} else if (type == 33) {
			// 线上共修
			wx.navigateTo({
				url: '/pageHappy/pageHappy/live/live'
			});
		} else if (type == 34) {
			// 灵性问答
		}
	},
	async getUserProfile(e) {
		app.getUserProfile(this);
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('personal', 'personal');
		data.share_true_url = data.share_true_url;
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
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})
