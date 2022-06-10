var util = require('../../../utils/util.js');
var app = getApp()
var config = require('../../../config');
Page({
	data: {
		isPlayer: false,
		title: '喜悦之路',
		type: 2,
		time: 'morning',
		list: [],
		dissolve_rule: [],
		activeId: 0,
		playInfo: '',
		article_team_id: 0,
		videoLoading: false,
		showScoreMask: false,
		earnScoreMask: false,
		activeIndex: 0,
		activeItem: {},
		score: 0,
		lastMusic: 0,
		price: 199,
		pay_to_url: '',
		videoList: [],
		typePlayMusic: 'normal'
	},
	onLoad: function(options) {
		//公用设置参数
		let that = this
		app.commonInit(options, this, async function(tokenInfo) {
			console.log(11111, options);

			// if (this.type == 2) {
			// 	this.title = '邱显峰老师瑜伽哲学精讲';
			// }
			that.setData({
				type: options.type || 2,
				time: options.time || 'morning'
			});
			if (that.data.type == 2) {
				that.classicsList();
				that.myIntegral();
			} else if (that.data.type == 3) {
				// that.demoTry();
			} else if (that.data.type == 1) {
				that.singMusicList()
			} else if (that.data.type == 4) {
				// that.meditationMusicList()
			}
		})
	},
	back(e) {
		wx[e.detail]({
			url: '/pageShop/pageShop/meditation/meditation'
		})
	},
	goUrl(item) {},
	goVideoSingle(id) {
		let list = this.data.list
		let index = ''
		list.forEach((item, index) => {
			if (this.data.activeId == item.id) {
				item.state = false
				index = index
				this.list.splice(index, 1, item);
			}
		});
		let obj = Object.assign(this.playInfo)
		obj.state = false
		this.playInfo = obj
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/remind/videoSingle?type=1&videoId=' + id
			});
		}, 0)
	},
	goTeam() {
		// 去加团
		uni.navigateTo({
			url: '/pages/remind/focus?url=' + this.pay_to_url
		});
	},
	next() {
		this.total++;
	},
	getPlayerState(val) {
		console.log(555, val)
		this.list.forEach((item, index) => {
			if (this.activeId == item.id) {
				item.state = val
				this.list.splice(index, 1, item);
			}
		});
		this.playInfo = {}
	},
	getLoading(val) {
		// this.videoLoading = val;
		this.setData({
			videoLoading: val.detail.isLoading,
		});
	},
	articleIntegral() {
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Pay/articleIntegral",
			data: {
				user_id: wx.getStorageSync('user_id') || "",
				article_id: this.data.activeItem.article_id,
				shop_id: wx.getStorageSync('watch_shop_id') || "",
			},
			success: function(res) {
				if (res.error == 0) {
					let obj = that.data.activeItem;
					obj.is_already_dissolve = 1;
					let list = that.data.list
					list.splice(that.data.activeIndex, 1, obj);
					that.myIntegral();
					that.setData({
						list: list,
					});
				} else if (res.error == 6) {
					that.setData({
						earnScoreMask: true,
						showScoreMask: false,
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
	unLockVideo(e) {
		let item = e.target.dataset.item || e.currentTarget.dataset.item
		let index = e.target.dataset.index || e.currentTarget.dataset.index
		this.setData({
			activeIndex: index,
			activeItem: item,
			showScoreMask: true,
		});
	},
	confirmLock() {
		if (this.data.score == 0) {
			this.setData({
				earnScoreMask: true,
				showScoreMask: false,
			});
			return;
		}
		this.setData({
			showScoreMask: false,
		});
		this.articleIntegral();
	},
	hideMask() {
		this.setData({
			earnScoreMask: false,
			showScoreMask: false,
		});
	},
	goEarn() {
		console.log(89)
	},
	close() {
		// if(this.data.type == 2){
		// 	this.setData({
		// 		playInfo:'',
		// 	});
		// }else{
		this.cutSong()
		// }
		this.sendEndInfo(47)
	},
	sendEndInfo(id){
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/User/getIntegral",
			data: {
				user_id:wx.getStorageSync('user_id') || '',
				integral_type_id:id,
				shop_id: wx.getStorageSync('shop_id') || '',
			},
			success: function(res) {
			}
		});
	},
	getCutSongIndex(index, type) {
		let nextIndex = 0
		if (type) {
			// 上一首下一首
			if (type == 'last') {
				nextIndex = --index
			} else {
				nextIndex = ++index
			}
		} else {
			if (this.data.typePlayMusic == 'random') {
				// 随机
				nextIndex = Math.floor(Math.random() * this.data.list.length)
			} else {
				// 顺序播放
				nextIndex = ++index
			}
		}
		return nextIndex
	},
	cutSong(type) {
		console.log('cutSong')
		let nextIndex = 0
		let list = this.data.list
		list = list.map((item, index) => {
			if (this.data.type == 2) {
				if (this.data.activeId == item.article_id) {
					nextIndex = this.getCutSongIndex(index, type)
					item.state = false;
				}
			} else {
				if (this.data.activeId == item.id) {
					nextIndex = this.getCutSongIndex(index, type)
					item.state = false;
				}
			}
			return item
		});
		console.log('cutSong', nextIndex)
		// 验证
		if (!this.data.list[nextIndex]) {
			console.log('err', nextIndex)
			if (this.data.type == 2) {
				this.setData({
					playInfo: '',
				});
				return
			} else {
				nextIndex = nextIndex < 0 ? this.data.list.length - 1 : 0
			}

		}

		console.log('cutSong2', nextIndex)
		let obj = this.data.list[nextIndex];
		obj.state = true
		console.log('cutSong3', obj)

		list.splice(nextIndex, 1, obj);

		// 未解锁课程不能放
		if (this.data.list[nextIndex] && this.data.list[nextIndex].is_already_dissolve != 1 && this.data.type == 2) {
			console.log('err1', nextIndex)
			this.setData({
				list: list,
				playInfo: '',
				earnScoreMask: true,
				showScoreMask: false,
			});
			return
		}

		this.setData({
			list: list,
			playInfo: obj,
			activeId: this.data.type == 2 ? this.data.list[nextIndex].article_id : this.data.list[nextIndex].id
		});
	},
	updateErr() {
		let list = this.data.list
		list = list.map((item, index) => {
			item.state = false;
			return item
		});
		this.setData({
			playInfo: '',
			list: list,
			activeId: 0
		});
	},
	startALL() {
		this.changeMusic('normal')
		if (!this.data.activeId) {
			this.playVideo('')
		}
	},
	changeMusic(type) {
		console.log(1112, type)
		if (type == 'last' || type == "next") {
			this.cutSong(type)
		} else {
			this.setData({
				typePlayMusic: type,
			});
			wx.showToast({
				title: type == 'random' ? '随机播放' : '全部播放',
				icon: 'none',
				duration: 1000
			});
		}
	},
	showPlayer(item, index) {
		this.isPlayer = true
		let obj = item;
		if (this.type == 1) {
			if (this.activeId != item.id) {
				// 播放另一首
				this.list.forEach(item => {
					item.state = false;
				});
				obj.state = !item.state;
				this.activeId = item.id;
			} else {
				// 同一首
			}

			obj.voice_url = obj.url;
		}
		this.playInfo = obj;
	},
	playVideo(e) {
		let item = null
		let index = 0
		if (e) {
			item = e.target.dataset.item || e.currentTarget.dataset.item
			index = e.target.dataset.index || e.currentTarget.dataset.index
		} else {
			item = this.data.list[0]
		}
		if (this.data.videoLoading && this.data.activeId == item.article_id) return
		console.log(123, item.state, item);
		let obj = item;
		let list = this.data.list
		let activeId = ''
		if (this.data.type == 2) {
			if (this.data.activeId != item.article_id) {
				// 播放另一首
				list = list.map(item => {
					item.state = false;
					return item
				});
			}
			activeId = item.article_id
			obj.state = !item.state;
		} else if (this.data.type == 1) {
			if (this.data.activeId != item.id) {
				// 播放另一首
				list = list.map(item => {
					item.state = false;
					return item
				});
			}
			activeId = item.id;
			obj.state = !item.state;
			obj.voice_url = obj.url;
		} else {
			// 3默认
			if (this.activeId != item.id) {
				// 播放另一首
				this.list.forEach(item => {
					item.state = false;
				});
			}
			this.activeId = item.id;
			obj.state = !item.state;
			obj.voice_url = obj.video_url;
		}
		list.splice(index, 1, obj);
		this.setData({
			playInfo: obj,
			list: list,
			activeId
		});
	},

	singMusicList() {
		let musicList = wx.getStorageSync('musicList') || []
		if (musicList.length > 0) {
			this.setData({
				list: musicList
			});
			return
		}
		if (this.data.isLoading) return;
		this.setData({
			isLoading: true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/singMusicList",
			data: {
				user_id: wx.getStorageSync('user_id') || ""
			},
			success: function(res) {
				that.setData({
					isLoading: false,
				})
				if (res.error == 0) {
					let list = res.data.map(item => {
						item.state = false;
						let str = item.name.split(' - ')
						item.intro = str[1]
						item.title = str[0]
						item.voice_url = item.url;
						return item;
					});
					wx.setStorageSync('musicList', list)
					that.setData({
						list: list
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
	chooseMusic(id) {
		let ajaxData = {
			user_id: this.user_id
		};
		if (this.time == 'morning') {
			ajaxData.morning_meditation_music_id = id
		}
		if (this.time == 'night') {
			ajaxData.night_meditation_music_id = id
		}
		this.$Api.yogaUserSet(ajaxData).then(res => {
			if (res.error == 0) {
				let pages = getCurrentPages();
				let name = pages.length == 1 ? 'reLaunch' : 'navigateBack'
				uni.showToast({
					title: '修改成功',
					icon: 'none',
					duration: 2000
				});
				setTimeout(() => {
					uni[name]({
						url: '/pages/index/index?tabBarIndex=4'
					});
				}, 1500)
			} else {
				uni.showToast({
					title: res.msg,
					icon: 'none',
					duration: 2000
				});
			}
		});
	},
	meditationMusicList() {
		if (this.isLoading) return;
		this.isLoading = true;
		let ajaxData = {
			user_id: this.user_id
		};
		this.$Api.meditationMusicList(ajaxData).then(res => {
			this.isLoading = false;
			if (res.error == 0) {
				if (this.time == 'morning') {
					this.activeId = res.data.select.morning_meditation_music_id
				}
				if (this.time == 'night') {
					this.activeId = res.data.select.night_meditation_music_id
				}
				this.list = res.data.list
			} else {
				uni.showToast({
					title: res.msg,
					icon: 'none',
					duration: 2000
				});
			}
		});
	},
	demoTry() {
		if (this.isLoading) return;
		this.isLoading = true;
		let data = {
			user_id: this.user_id,
			on_line_course_id: 173
		};
		this.$Api.demoTry(data).then(res => {
			this.isLoading = false;
			if (res.error == 0) {
				this.article_team_id = res.data.pay_state;
				this.list = res.data.list_173
				let demoVideo = {}
				res.data.list_174.forEach((item) => {
					demoVideo[item.id] = item
					item.state = false;
					return item;
				})
				this.videoList = res.data.list_174
				uni.setStorageSync('demoVideo', demoVideo)
			} else {
				uni.showToast({
					title: res.msg,
					icon: 'none',
					duration: 2000
				});
			}
		});
	},
	myIntegral() {
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/User/myIntegral",
			data: {
				user_id: wx.getStorageSync('user_id') || "",
				shop_id: wx.getStorageSync('watch_shop_id') || "",
			},
			success: function(res) {
				if (res.error == 0) {
					that.setData({
						score: res.data.surplus_integral
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
	classicsList() {
		if (this.data.isLoading) return;
		this.setData({
			isLoading: true,
		})
		var that = this;
		util.ajax({
			url: util.config("baseApiUrl") + "Api/Article/classicsList",
			data: {
				user_id: wx.getStorageSync('user_id') || ""
			},
			success: function(res) {
				that.setData({
					isLoading: false,
				})
				if (res.error == 0) {
					that.setData({
						article_team_id: res.data.pay_state,
						price: res.data.pay_price,
						pay_to_url: res.data.pay_to_url,
						dissolve_rule: res.data.dissolve_rule,
						lastMusic: res.data.lately_dissolve_article_id,
						list: res.data.list.map(item => {
							item.state = false;
							item.intro = item.intro.replace('邱显峰老师讲解', '')
							item.author = '邱显峰老师'
							return item;
						})
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
		var data = app.shareInit('pageHappy', 'musicList/musicList');
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
