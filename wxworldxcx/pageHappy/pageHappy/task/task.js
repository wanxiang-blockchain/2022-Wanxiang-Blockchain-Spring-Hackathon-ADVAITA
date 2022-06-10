var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		signinTime: 16,
		task:[],
		sportNum:0,
		finishState:0
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this,async function(tokenInfo) {
			const timeDate = new Date();
			let isGone = timeDate.getHours()
		
			let initData = wx.getStorageSync('sportNum') || {}
			let time = new Date()
			let today = util.formatOnlyDates(time)
			let num = 0
			if(initData?.today && initData?.today == today && (time.getTime()-initData?.update<60*30*1000)){
				num = initData.num
			}else{
				that.getWeRunData()
			}
			that.setData({
				sportNum: num * 1,
				isGone : isGone,
			});
			that.sendScore();
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	goDetail(e) {
		let type = e.target.dataset.id || e.currentTarget.dataset.id
		let count = e.target.dataset.count || e.currentTarget.dataset.count
		let can = e.target.dataset.can || e.currentTarget.dataset.can
		if (type == 27) {
			// 报告1份
			wx.navigateTo({
				url: '/pages/index/index'
			});
		} else if (type == 45 || type == 46) {
			// 早冥想 晚冥想 
			wx.navigateTo({
				url: '/pageShop/pageShop/audioPlayer/audioPlayer'
			});
		} else if (type == 47) {
			// 经典 
			wx.navigateTo({
				url: '/pageHappy/pageHappy/musicList/musicList?type=2'
			});
		} else if (type == 28 || type == 29 || type == 37) {
			// 持戒精进
			wx.navigateTo({
				url: '/pageShop/pageShop/meditation/meditation'
			});
		} else if (type == 39 || type == 41) {
			// 点赞 发布动态
			wx.navigateTo({
				url: '/pageFriend/pageFriend/friendCircle/friendCircle'
			});
		} else if (type == 33 || type == 40) {
			// 线上共修
			wx.navigateTo({
				url: '/pageHappy/pageHappy/shareNight/shareNight'
			});
		}
	},
	sendScore(){
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
		let that = this;
		that.setData({
			isLoading: true,
		})
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/myIntegral',
			data: {
				user_id: id,
				shop_id: wx.getStorageSync('watch_shop_id')
			},
			success: function(ress) {
				that.setData({
					isLoading: false,
				})
				if (ress.error == 0) {
					let target_num = 0
					let score = 0
					let finishState = 0
					let arr = ress.data.task_list.filter((item)=>{
						if(item.integral_type_id == 32){
							target_num = item.title.replace(/[^\d]/g,'') * 1
							score = item.integral_num
							finishState = item.is_can
							// target_num = 2000
						}
						return item.integral_type_id != 32
					})
					
					let list = {}
					ress.data.task_list.forEach((item)=>{
						list[item.integral_type_id] = item
					})
					wx.setStorageSync('taskList', list)
					that.setData({
						taskList: arr,
					})
					
					that.setData({
						task: arr,
						total: ress.data.surplus_integral || 0,
						target_num,
						score,
						finishState
					})
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	getSportInfo(res){
		let that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Wechat/xcxGetStepNum',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				encrypted_data: res.encryptedData,
				iv:res.iv,
				session_key:wx.getStorageSync('session_key')
			},
			success: function(ress) {
				if (ress.error == 0) {
					let initData = wx.getStorageSync('sportNum') || {}
					initData.today = util.formatOnlyDates(new Date())
					initData.num = ress.data.today_step_num * 1
					initData.update = new Date().getTime()
					wx.setStorageSync('sportNum', initData)
					that.setData({
						sportNum: ress.data.today_step_num * 1,
					});
					wx.showToast({
						title: '刷新成功',
						icon: 'none',
						duration: 2000
					});
				} else {
					wx.showToast({
						title: ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	getWeRunData(){
		let _this = this
		wx.getWeRunData({
			success(res) {
				console.log('位置', res)
				_this.getSportInfo(res)
			},
			fail(e){
				console.log('fail getLocation', e)
			},
			complete(){
				_this.setData({
					isLoading: false,
				});
			}
		})
	},
	async getSport(){
		let _this = this
		let that = this
		_this.setData({
			isLoading: true,
		});
		
		let res = await util.getSettingSave()
		if (!res.authSetting["scope.werun"]) {
			wx.authorize({
				scope: "scope.werun",
				success: () => {
					// 同意授权
					res.authSetting['scope.werun'] = true
					wx.setStorageSync('setting', res);
					that.getWeRunData()
				},
				fail: res => {
					console.log("拒绝了授权", res);
					wx.showModal({
						title: '温馨提示',
						content: '您需要授权后，才能使用，是否重新授权',
						confirmColor: '#ff2d4a',
						success(res1) {
							if (res1.confirm) {
								wx.openSetting({
									success(res2) {
										console.log('设置success：', res2)
										wx.setStorageSync('setting', res2);
										if (res2.authSetting['scope.werun'] === true) {
											that.getWeRunData()
										}else{
											console.log('设置fail:', res2)
											wx.showToast({
												title: '获取失败',
												icon: 'none',
												duration: 2000
											});
											_this.setData({
												isLoading: false,
											});
										}
									},
									fail(err) {
										console.log('设置fail:', err)
										wx.showToast({
											title: '获取失败',
											icon: 'none',
											duration: 2000
										});
										_this.setData({
											isLoading: false,
										});
									}
								})
								
							} else if (res1.cancel) {
								console.log('用户点击取消')
								wx.showToast({
									title: '获取失败',
									icon: 'none',
									duration: 2000
								});
								_this.setData({
									isLoading: false,
								});
							}
						}
					})
				}
			});
		} else {
			// 已经授权了
			that.getWeRunData()
		}
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'task/task');
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
