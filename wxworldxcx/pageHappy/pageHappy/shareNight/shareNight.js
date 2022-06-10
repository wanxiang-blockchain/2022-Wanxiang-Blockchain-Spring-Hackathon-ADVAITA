var util = require('../../../utils/util.js');
var app = getApp()

Page({
	data: {
		URL: 4,
		time: [],
		nightMeditation: {
			duration: "20:20",
			id: "29",
			intro: "",
			is_list_hide: "1",
			title: "线上共修",
			type: "27",
			voice_url: "https://i.2fei2.com/%E9%82%B1%E8%80%81%E5%B8%88.mp3"
		},
		avatarArr: [
			'https://i.2fei2.com/shop/logo/2021-01-28/13:44:58/60124f5adacf5.png',
			'https://i.2fei2.com/shop/logo/2021-01-28/13:45:16/60124f6c4d8a3.png',
			'https://i.2fei2.com/shop/logo/2021-01-28/13:45:32/60124f7c43cf0.png',
			'https://i.2fei2.com/shop/logo/2021-01-28/13:45:49/60124f8d13f35.png',
			'https://i.2fei2.com/shop/logo/2021-01-28/13:46:06/60124f9e767c5.png',
			'https://i.2fei2.com/shop/logo/2021-01-28/13:46:27/60124fb33bae2.png'
		],
		textToast:'',
		isStart: false,
		isEnd: false,
		markers: [],
		showErr: false,
		isShowAll: false,
		endAudio: false,
		showTips: false,
		isLoading: false,
		failLocation: false,
		failLoading: false,
		mapScale: 16,
		enterTime: 0,
		showSign: false,
		isLogin: false,
		computeNumber:['0','0',',','0','0','0',',','9','1','7'],
	},
	onLoad: function(options) {
		var that = this;
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		//公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			let startTime = new Date().setHours(22, 0, 0, 0)
			let endTime = new Date().setHours(22, 30, 0, 0)
			// let startTime = new Date().setHours(9, 30, 0, 0)
			// let endTime = new Date().setHours(10, 0, 0, 0)
			that.setData({
				startTime,
				endTime,
				isLogin: !that.data.userInfo
			});
			that.getLocation();
			that.sendScore()
		})
	},
	onUnload() {
		clearInterval(this.timer)
		clearInterval(this.enterTimer)
		clearInterval(this.refreshTimer)
	},
	back(e) {
		wx[e.detail]({
			url: '/pageHappy/pageHappy/live/live'
		})
	},
	sendScore(){
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
		let data = wx.getStorageSync('taskList') || {}
		if(JSON.stringify(data) != "{}") {
			this.setData({
				taskList: data,
			})
			return
		}
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
					let arr = {}
					ress.data.task_list.forEach((item)=>{
						arr[item.integral_type_id] = item
					})
					wx.setStorageSync('taskList', arr)
					that.setData({
						taskList: arr,
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
	getLocationInfo(){
		var _this = this
		wx.getLocation({
			type: 'gcj02',
			success(res) {
				_this.setData({
					failLocation: false,
				});
				console.log('位置', res)
				_this.getInfo(res)
			},
			fail(e) {
				console.log('fail getLocation', e)
				_this.setData({
					failLocation: true,
				});
			},
			complete() {
				_this.setData({
					isLoading: false,
				});
			}
		})
	},
	async getLocation() {
		var _this = this
		var that = this
		_this.setData({
			isLoading: true,
		});
		let res = await util.getSettingSave()
		if (!res.authSetting["scope.userLocation"]) {
			wx.authorize({
				scope: "scope.userLocation",
				success: () => {
					// 同意授权
					res.authSetting['scope.userLocation'] = true
					wx.setStorageSync('setting', res);
					that.getLocationInfo()
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
										if (res2.authSetting['scope.userLocation'] === true) {
											that.getLocationInfo()
										}else{
											console.log('设置fail:', res2)
											wx.showToast({
												title: '获取失败',
												icon: 'none',
												duration: 2000
											});
											_this.setData({
												isLoading: false,
												failLocation: true,
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
											failLocation: true,
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
									failLocation: true,
								});
							}
						}
					})
				}
			});
		} else {
			// 已经授权了
			that.getLocationInfo()
		}
	},
	closeLogin() {
		this.setData({
			isLogin: false
		})
	},
	pause(){
		clearInterval(this.refreshTimer)
	},
	getInfo(data) {
		var that = this;

		function getRefresh() {
			that.infoAjax(that.data.userLocation)
			// let markers = that.data.markers
			// markers.push(that.data.markers[0])
			// let avatar = that.data.avatar
			// avatar.forEach((item,index)=>{
			// 	item.left = item.left + 50
			// })
			// let one = Object.assign({},that.data.avatar[0]) 
			// one.left = 0
			// avatar.push(one)
			
			// that.setData({
			// 	markers,
			// 	avatar:avatar.slice(-14),
			// });
		}
		this.refreshTimer = setInterval(getRefresh, 90*1000)
		this.infoAjaxInit(data)
	},
	infoAjax(data) {
		var that = this;
		let userId = wx.getStorageSync('user_id')
		if (!userId) {
			return
		}
		that.setData({
			isLoading: true,
		});
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Activity/onLineStylite",
			data: {
				user_id: userId || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				latitude: data.latitude || '',
				longitude: data.longitude || '',
				wechat_img: that.data.userInfo.avatar_url || '',
			},
			success: function(res) {
				that.setData({
					isLoading: false,
					failLoading: false
				});
				if (res.error == 0) {
					var list = res.data.list;
					let markers = []
					list.map(item => {
						markers.push({
							id: item.user_id,
							latitude: item.latitude * 1,
							longitude: item.longitude * 1,
							iconPath: userId == item.user_id ? item.qiniu_img + '?roundPic/radius/!50p' : that.data.avatarArr[Math.floor(
								Math.random() * 6)],
							// iconPath: item.qiniu_img+'?roundPic/radius/!50p',
							width: userId == item.user_id ? '50' : '22',
							height: userId == item.user_id ? '50' : '22',
							circles: true
						})
					});
					
					// let avatar = that.data.avatar
					// avatar.forEach((item,index)=>{
					// 	item.left = item.left + 50
					// })
					// let num = res.data.list.length - that.data.avatar.length
					// let surplus = res.data.list.slice(-num)
					// if(surplus.length>0){
					// 	this.addTimer = setInterval(()=>{
					// 		let one = Object.assign({},that.data.avatar[0])
					// 		one.left = 0
					// 		avatar.push(one)
					// 	},1000)
					// }
					let ava = res.data.list.slice(-12)
					ava = ava.reverse()
					ava.forEach((item,index)=>{
						item.left = index*50
					})
					ava = ava.reverse()
					that.setData({
						markers,
						avatar: ava,
						avatarAll: res.data.list,
						// sign_state:0,
					});
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 1000
					});
				}
			},
			error(e) {
				that.setData({
					isLoading: false,
					failLoading: true
				});
			}
		});
	},
	infoAjaxInit(data) {
		var that = this;
		let userId = wx.getStorageSync('user_id')
		if (!userId) {
			return
		}
		that.setData({
			userLocation: data,
			isLoading: true,
		});
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Activity/onLineStylite",
			data: {
				user_id: userId || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				latitude: data.latitude || '',
				longitude: data.longitude || '',
				wechat_img: that.data.userInfo.avatar_url || '',
			},
			success: function(res) {
				that.setData({
					isLoading: false,
					failLoading: false
				});
				if (res.error == 0) {
					var list = res.data.list;
					let markers = []
					list.map(item => {
						markers.push({
							id: item.user_id,
							latitude: item.latitude * 1,
							longitude: item.longitude * 1,
							iconPath: userId == item.user_id ? item.qiniu_img + '?roundPic/radius/!50p' : that.data.avatarArr[Math.floor(
								Math.random() * 6)],
							// iconPath: item.qiniu_img+'?roundPic/radius/!50p',
							width: userId == item.user_id ? '50' : '22',
							height: userId == item.user_id ? '50' : '22',
							circles: true
						})
					});
					let audio = that.data.nightMeditation
					audio.voice_url = res.data.music_url
					
					let ava = res.data.list.slice(-12)
					ava = ava.reverse()
					ava.forEach((item,index)=>{
						item.left = index*50
					})
					ava = ava.reverse()
					that.setData({
						markers,
						avatar: ava,
						avatarAll: res.data.list,
						sign_state: res.data.sign_state,
						// sign_state:0,
						nightMeditation: audio,
						textToast :'任务完成 +'+that.data.taskList[40].integral_num+'分',
					});
					setTimeout(() => {
						that.setData({
							mapScale: 4
						});
					}, 100)
					that.startTime();
				} else {
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 1000
					});
				}
			},
			error(e) {
				that.setData({
					isLoading: false,
					failLoading: true
				});
			}
		});
	},
	changeSign() {
		if (this.data.sign_state == 0) {
			var that = this;
			that.setData({
				isLoading: true,
			});
			let userId = wx.getStorageSync('user_id') || ""
			util.ajax({
				url: util.config("baseApiUrl") + "Api/Article/joyfulWayPunch",
				data: {
					user_id: userId,
					article_id: 1584,
					add_time: new Date().getTime() / 1000
				},
				success: function(res) {
					that.setData({
						isLoading: false,
					});
					if (res.error == 0 || res.error == 1) {
						that.setData({
							sign_state: 1,
							textToast :'任务完成 +'+that.data.taskList[33].integral_num+'分',
						});
					} else {
						wx.showToast({
							title: res.msg,
							icon: 'none',
							duration: 1000
						});
					}
				},
				error() {
					that.setData({
						isLoading: false,
					});
					wx.showToast({
						title: res.msg,
						icon: 'none',
						duration: 1000
					});
				}
			});
		}
	},
	showAll() {
		this.setData({
			isShowAll: !this.data.isShowAll
		});
	},
	isEnterEnough() {
		let that = this

		function getEnter() {
			let time = that.data.enterTime + 2 * 60 * 1000 - new Date().getTime()
			if (time < 0) {
				that.setData({
					showSign: true
				})
				clearInterval(that.enterTimer)
			}
		}
		this.enterTimer = setInterval(getEnter, 1000)
		getEnter()
	},
	startTime() {
		let that = this
		if (this.data.sign_state != 0) {
			// 已打卡不开始音频
			this.setData({
				endAudio: true,
			});
		}

		that.checkTime()
		if (!this.data.isStart) {
			// 未开始
			function getArr() {
				that.checkTime()
				let time = that.data.startTime - new Date().getTime()
				if (time < 0) {
					that.startEnterTime()
					clearInterval(that.timer)
				}
				that.setData({
					time: util.formatSecondString(time / 1000)
				})
			}
			this.timer = setInterval(getArr, 1000)
			getArr()
		} else {
			if (this.data.sign_state == 0) {
				// 没打卡的开始计时
				this.startEnterTime()
			}
		}


	},
	startEnterTime() {
		// 直接开始
		let enterTime = new Date().getTime()
		this.setData({
			enterTime
		})
		this.isEnterEnough()
	},
	cancel() {
		if (this.data.showTips) {
			// 自动结束
			this.setData({
				showTips: false,
			});
		} else {
			// 出错
			this.setData({
				showErr: false,
				endAudio: true,
				showSign: true
			});
			clearInterval(this.enterTimer)
			// let pages = getCurrentPages();
			// let name = pages.length == 1 ? 'reLaunch':'navigateBack'
			// wx[name]({
			// 	url: '/pageHappy/pageHappy/live/live'
			// })
		}
	},
	checkTime() {
		let now = new Date().getTime()
		let isStart = this.data.startTime - now < 0
		let isEnd = this.data.endTime - now < 0
		this.setData({
			isStart,
			isEnd,
		});
	},
	close() {
		// this.checkTime()
		this.setData({
			endAudio: true,
			isStart: true,
			isEnd: this.data.sign_state != 0
		});
		if (this.data.sign_state == 0) {
			this.setData({
				showTips: true,
			});
		}

	},
	isPlayChange(e) {
		if (!e.detail) {
			// this.checkTime()
		}
	},
	updateErr() {
		this.setData({
			showErr: true
		})
	},
	// 分享接口
	onShareAppMessage: function() {
		var that = this;
		var tokenInfo = wx.getStorageSync('tokenInfo')
		var data = app.shareInit('pageHappy', 'shareNight/shareNight');
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
						console.log('成功分享记录');
						console.log(res);
					}
				}) //end 分享记录
			}
		}
	}, //end 分享接口
})
