var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		videoList: [],
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.gestureList();
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	goVideoSingle(e){
		var that = this;
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/joyfulWayPunch",
			data: {
				user_id:wx.getStorageSync('user_id') || '',
				article_id:id,
				add_time:Math.floor(new Date().getTime()/1000)
			},
			success: function(res) {
			}
		});
		// this.$Api.joyfulWayPunch(this.user_id, id).then(res => {
			
		// });
		wx.navigateTo({
			url: '/pageHappy/pageHappy/videoSingle/videoSingle?type=2&videoId='+id
		});
	},
	gestureList() {
		// 获取首页数据
		if (this.data.isLoading) return;
		this.setData({
			isLoading : true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/gestureList",
			data: {
				user_id:wx.getStorageSync('user_id') || ''
			},
			success: function(res) {
				that.setData({
					isLoading : false,
				})
				if (res.error == 0) {
					let demoVideo = {}
					res.data.forEach((item)=>{
						item.name = item.intro.split('-')
						demoVideo[item.article_id] = item
					})
					wx.setStorageSync('gestureVideo', demoVideo)
					that.setData({
						videoList : res.data,
					})
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		});
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'videoList/videoList');
		data.share_true_url = data.share_true_url.replace('pages', 'pageHappy');
		console.log(data.share_true_url);
		return {
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
