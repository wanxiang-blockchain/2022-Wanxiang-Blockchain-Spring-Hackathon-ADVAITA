var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		video_list: [],
		pay_state: '',
		pay_price: '',
		article_list: []
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.jejunitas();
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	goChat(){
		wx.previewImage({
		   current: 'https://i.2fei2.com/goods/logo/2021-08-05/11:40:09/610b5d99b55c9.png',
		   urls: ['https://i.2fei2.com/goods/logo/2021-08-05/11:40:09/610b5d99b55c9.png']
		})
	},
	jejunitas(){
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "/Api/Course/jejunitas",
			data: {
				user_id:wx.getStorageSync('user_id') || ''
			},
			success: function(res) {
				if (res.error == 0) {
					let demoVideo = {}
					res.data.video_list.forEach((item)=>{
						demoVideo[item.id] = item
						return item;
					})
					wx.setStorageSync('fastingVideo', demoVideo)
					that.setData({
						pay_state:res.data.pay_state,
						pay_price:res.data.pay_price,
						article_list:res.data.article_list,
						video_list:res.data.video_list,
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
	goArticle(e) {
		let item = e.target.dataset.item || e.currentTarget.dataset.item
		wx.navigateTo({
			url: '/pageHappy/pageHappy/article/article?articleId=' + item.article_id
		});
	},
	goVideoSingle(e){
		let item = e.target.dataset.item || e.currentTarget.dataset.item
		wx.navigateTo({
			url: '/pageHappy/pageHappy/videoSingle/videoSingle?type=3&videoId='+item.id
		});
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'fasting/fasting');
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
