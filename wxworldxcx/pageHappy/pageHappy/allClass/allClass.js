var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		isLoading: false,
		hot_course: []
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.setData({
				articleId : options.articleId || '',
			})
			that.getHotClass()
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	getHotClass() {
		let hot_course = wx.getStorageSync('hot_course') || [];
		if (hot_course.length > 0) {
			this.setData({
				hot_course:hot_course
			})
			return;
		}
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/joyfulWay",
			data: {
				user_id:wx.getStorageSync('user_id') || '',
				this_time:Math.floor(new Date().getTime()/1000)
			},
			success: function(res) {
				that.setData({
					isLoading : false,
				})
				if (res.error == 0) {
					that.setData({
						hot_course:res.data.hot_course
					})
					wx.setStorageSync('hot_course', res.data.hot_course)
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
	goWeb(e) {
		wx.navigateTo({
			url: "/pages/focus/focus?url=" +
				e.currentTarget.dataset.url
		});
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'allClass/allClass');
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
