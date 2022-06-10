var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		tab: 1,
		type:1,
		apply_activity_id: '',
		videoId: -1,
		info: '',
		videoList: {},
		playVideo: {
			mingxiang: {
				video_url: 'https://i.2fei2.com/3.20%E6%89%93%E5%8D%A1-%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E5%86%A5%E6%83%B3.mp4',
				title: '为什么要瑜伽冥想?',
				teacher_name: '邱显峰',
				teacher_logo_url: 'http://i.2fei2.com/5ec7449183d0c.jpg'
			},
			chijie: {
				video_url: 'https://i.2fei2.com/3.21%E6%89%93%E5%8D%A1-%E6%8C%81%E6%88%92%E4%B8%8E%E7%B2%BE%E8%BF%9B.mp4',
				title: '什么是瑜伽持戒和精进',
				teacher_name: '邱显峰',
				teacher_logo_url: 'http://i.2fei2.com/5ec7449183d0c.jpg'
			}
		},
		isPlay: false
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			that.setData({
				type : options.type || 1,
				videoId : options.videoId || -1,
			})
			if (that.data.type == 1) {
				that.demoVideo();
			}else if(that.data.type == 2){
				that.gestureVideo();
			}else{
				that.fastingVideo();
			}
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	demoVideo(){
		let videoList = wx.getStorageSync('demoVideo')||{}
		if(videoList[this.data.videoId]){
			this.data.videoList = videoList
		}else{
			var that = this;
			util.ajax({
				url: util.config("baseApiUrl") + "/Api/Course/demoTryPage2",
				data: {
					user_id:wx.getStorageSync('user_id') || '',
					on_line_course_id:173
				},
				success: function(res) {
					if (res.error == 0) {
						let demoVideo = {}
						res.data.list_174.forEach((item)=>{
							demoVideo[item.id] = item
						})
						wx.setStorageSync('demoVideo', demoVideo)
						that.setData({
							videoList:demoVideo,
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
		}
	},
	gestureVideo(){
		let videoList = wx.getStorageSync('gestureVideo')||{}
		if(videoList[this.data.videoId]){
			const info = util.getArticle(videoList[this.data.videoId].content);
			let str = info.replace(/<p><br\/><\/p>/g,'')
			this.info = str
			this.setData({
				videoList:videoList,
				info:str
			});
		}else{
			let data = {
				user_id: this.user_id
			};
			var that = this;
			util.ajax({
				url: util.config("baseApiUrl") + "/Api/Article/gestureList",
				data: {
					user_id:wx.getStorageSync('user_id') || '',
				},
				success: function(res) {
					if (res.error == 0) {
						let demoVideo = {}
						res.data.forEach((item)=>{
							item.name = item.intro.split('-')
							demoVideo[item.article_id] = item
						})
						const info = util.getArticle(demoVideo[that.data.videoId].content);
						let str = info.replace(/<p><br\/><\/p>/g,'')
						wx.setStorageSync('gestureVideo', demoVideo)
						that.setData({
							videoList:demoVideo,
							info:str
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
		}
	},
	fastingVideo(){
		let videoList = wx.getStorageSync('fastingVideo')||{}
		if(videoList[this.data.videoId]){
			this.setData({
				videoList:videoList,
			});
		}else{
			var that = this;
			util.ajax({
				url: util.config("baseApiUrl") + "/Api/Course/jejunitas",
				data: {
					user_id:wx.getStorageSync('user_id') || '',
				},
				success: function(res) {
					if (res.error == 0) {
						let demoVideo = {}
						res.data.video_list.forEach((item)=>{
							demoVideo[item.id] = item
						})
						wx.setStorageSync('fastingVideo', demoVideo)
						that.setData({
							videoList:demoVideo,
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
		}
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'videoSingle/videoSingle');
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
