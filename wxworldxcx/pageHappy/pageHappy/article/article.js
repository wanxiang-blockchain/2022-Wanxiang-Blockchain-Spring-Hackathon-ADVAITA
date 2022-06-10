var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		isLoading: false,
		info:'',
		title:''
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.setData({
				articleId : options.articleId || '',
			})
			that.getCommonInfo()
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	getCommonInfo(){
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "/Api/Article/getInfo",
			data: {
				click_user_id:wx.getStorageSync('user_id') || '',
				article_id:that.data.articleId
			},
			success: function(res) {
				if (res.error == 0) {
					const info = util.getArticleChange(res.data.content);
					that.setData({
						info:info,
						title:res.data.title,
					});
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
		var data = app.shareInit('pageHappy', 'article/article');
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
