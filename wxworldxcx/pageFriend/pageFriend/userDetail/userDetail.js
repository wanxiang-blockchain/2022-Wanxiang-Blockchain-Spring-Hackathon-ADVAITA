var util = require('../../../utils/util.js');
var app = getApp();

Page({
	data: {
		URL: 3,
		showWechatMask: false,
		showAuthMask:false,
		page_no: 1,
		page_num: 10,
		list: [],
		listMore: false,
		id: "",
		info: {},
		screenHeight: 0,
		contentHeight: 0,
		loading:false,
		delUserMask:false,
		isFirst:true,
		my_id:'',
		isShowFly:true,
	},
	onPageScroll: util.debounce(function(msg) {
		this.isScrollEnd(msg[0].scrollTop)
	}),
	onLoad: function(options) {
		var that = this
		// wx.showShareMenu({
		// 	withShareTicket: true,
		// 	menus: ['shareAppMessage', 'shareTimeline']
		// });
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {

			let resSystem = wx.getSystemInfoSync()
			that.setData({
				id: that.data._GET.id || "",
				userId:that.data._GET.userId  || "",
				screenHeight: resSystem.windowHeight,
				my_id: wx.getStorageSync('user_id') || ''
			})
			setTimeout((item) => {
				that.setData({
					isFirst: false
				})
			}, 1000)
			that.getDetail()
			that.treportList();
		}); //end 公用设置参数
	},
	onShow: function() {
		if(!this.data.isFirst){
			this.getDetail()
			this.treportList();
		}
	},
	back() {
		let pages = getCurrentPages();
		let name = pages.length == 1 ? 'reLaunch':'navigateBack'
		wx[name]({
			url: '/pages/index/index'
		});
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	triggleFly(e){
		this.setData({
			isShowFly: e.detail
		})
	},
	deleteUser(){
		// 关注
		var that = this;
		util.ajax({
		    url: util.config('baseApiUrl') + 'Api/User/attentionUser',
		    data: {
		        user_id: wx.getStorageSync('user_id') || '',
				beattent_user_id:that.data.id || ''
		    },
		    success: function(ress) {
		        if (ress.error == 0) {
					wx.showToast({
						title:'操作成功',
						icon: 'none',
						duration: 2000
					});
					that.setData({
						delUserMask : false
					})
					that.getDetail()
		        }else{
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
		    }
		})
	},
	deleteFamily(){
		// 升级/降级家人
		var that = this;
		util.ajax({
		    url: util.config('baseApiUrl') + 'Api/Exercise/treportSetUserAuth',
		    data: {
		        user_id: wx.getStorageSync('user_id') || '',
		        shop_id: wx.getStorageSync('watch_shop_id') || '',
				bind_treport_user_table_id:that.data.userId || '',
				auth_type:that.data.info.is_family == 1?1:2
		    },
		    success: function(ress) {
		        if (ress.error == 0) {
					wx.showToast({
						title:'操作成功',
						icon: 'none',
						duration: 2000
					});
					that.setData({
						delfamilyMask : false,
						showAuthMask:false
					})
					that.getDetail()
		        }else{
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
		    }
		})
	},
	goDetail(e){
		if(this.data.info.my_look_treport_auth == 2 || !this.data.info.my_look_treport_auth){
			let dev = e.target.dataset.dev || e.currentTarget.dataset.dev
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			let bindid = e.target.dataset.bindid || e.currentTarget.dataset.bindid
			wx.navigateTo({
				url: '/pageWatch/pageWatch/treport/treport?DeviceIdentity='+dev+'&id=' + id+'&bindid='+bindid
			})
		}else{
			wx.showToast({
				title: '暂无报告详情',
				icon: 'none',
				duration: 1000
			});
		}
		
	},
	hideDeleteUser(){
		this.setData({
			delUserMask : false
		})
	},
	hideDeleteFamily(){
		this.setData({
			delfamilyMask : false
		})
	},
	showDeleteUser(){
		this.setData({
			delUserMask : true,
			showAuthMask:false
		})
	},
	triggleDeleteUser(){
		if(this.data.info.is_attent == 1){
			this.setData({
				showAuthMask: !this.data.showAuthMask
			})
		}else{
			// 关注
			this.deleteUser()
		}
		
	},
	changeScroll(e) {
		var that = this;
		wx.createSelectorQuery()
			.in(that)
			.select('.m-content')
			.boundingClientRect(function(res) {
				that.isScrollEnd(Math.abs(res.top))
				// that.setData({
				// 	contentHeight: res.height
				// })
			})
			.exec();
	},
	
	goLove(e) {
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		let index = e.target.dataset.index || e.currentTarget.dataset.index
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/agreeDynamic',
			data: {
				user_id: wx.getStorageSync('user_id'),
				dynamic_id: id || ""
				// page_no: that.data.page_no,
				// page_num: that.data.page_num,
			},
			success: function(ress) {
				if (ress.error == 0) {
					let arr = that.data.list
					arr[index].agree_num = ress.data.agree_state?(arr[index].agree_num*1 + 1):(arr[index].agree_num*1 - 1)
					arr[index].agree_state = ress.data.agree_state?1:0
					that.setData({
						list: arr
					})
				} else {
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	getDetail() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/treportUserInfo',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				bind_treport_user_table_id: that.data.userId || "",
				look_user_id:wx.getStorageSync('user_id'),
				treport_user_id: that.data.id || "",
				// page_no: that.data.page_no,
				// page_num: that.data.page_num,
			},
			success: function(ress) {
				if (ress.error == 0) {
					// let data = ress.data.map((item)=>{
					// 	item.time = util.formatTimes(new Date(item.add_time*1000))
					// 	return item
					// })
					// let list = that.data.page_no == 1 ? data : that.list.concat(data);
					that.changeUserBtn(ress.data)
					that.setData({
						info: ress.data,
						// listMore: !(list.length == ress.count)
					})
				} else {
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			}
		})
	},
	changeUserBtn(data){
		let focusText = '关注'
		if(data.is_attent != 0 && data.is_family != 0){
			focusText = '家人'
		}else if(data.is_attent != 0 && data.is_family == 0){
			focusText = '已关注'
		}
		this.setData({
			focusText,
			// listMore: !(list.length == ress.count)
		})
	},
	forbiddenBubble() {
		
	},
	isScrollEnd(scroll) {
		let val = scroll || 0
		if(this.data.contentHeight - this.data.screenHeight - val <= 200){
			if (this.data.listMore) {
				let num = this.data.page_no + 1
				this.setData({
					page_no: num
				})
				this.treportList();
			}
		}
	},
	treportList() {
		if(this.data.info.look_treport_auth == 3)return
		var that = this;
		that.setData({
			loading: true
		})
		
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/getUserFriendDynamic',
			data: {
				shop_id: wx.getStorageSync('watch_shop_id'),
				user_id: that.data.id,
				page_num: that.data.page_num, //把第几次加载次数作为参数 
				page_no: that.data.page_no, //返回数据的个数 
				is_show_my:1
			},
			success: function(ress) {
				that.setData({
					loading: false
				})
				if (ress.error == 0) {
					let data = ress.data.map((item,index)=>{
						// 发送时间
						item.timeCircle = util.formatTimeState(item.add_time)
						item.timeOnlyTimes = util.formatOnlyTimes(new Date(item.add_time * 1000))
						item.starttime_text = util.formatTimes(new Date(item.add_time * 1000))
						// 类型
						if (item.treport instanceof Array) {
							item.cicleType = item.slide_img.length > 0 ? 'img' : 'text'
						} else {
							item.cicleType = 'report'
						}
						// 图片轮播
						let arr = []
						item.slide_img && item.slide_img.forEach((obj) => {
							arr.push(obj.url)
							return
						})
						item.imgArr = arr
						// 评论删除弹出状态
						item.dynamic_remark_list.map((obj) => {
							obj.active = false
							return obj
						})
						// 评论添加弹出状态
						item.commentMask = false
						// 动态文字
						item.textOver = false
						item.textIsShow = false
						// 是否到可视区
						item.autoplay = index == 0 || index == 1
						// 点赞人
						item.myHugList = Object.values(item.dynamic_hug_list).map(item => { return item.nickname })
						// 是否滚动
						item.isScroll = false
						return item
					})
					let list = that.data.page_no == 1 ? ress.data : that.data.list.concat(ress.data);
					that.setData({
						list: list,
						listMore: !(list.length == ress.count)
					})
					setTimeout((item) => {
						wx.createSelectorQuery()
							.in(that)
							.select('.m-content')
							.boundingClientRect(function(res) {
								that.setData({
									contentHeight: res.height
								})
							})
							.exec();
					}, 100)
				} else {
					that.setData({
						list: [],
						listMore: false
					})
					wx.showToast({
						title:ress.msg,
						icon: 'none',
						duration: 2000
					});
				}
			},
			error(){
				that.setData({
					loading: false
				})
			}
		})
	},
	refreshPage(e) {
		if (e.detail) {
			this.setData({
				page_no: Math.ceil(e.detail.index / 10) || 1
			}, () => {
				this.treportList(e.detail.index);
			})
		}
	},
	// 分享接口
	onShareAppMessage: function(res) {
		var that = this;
		var data = null
		data = app.shareInit('pageFriend', 'userDetail/userDetail');
		data.share_true_url = data.share_true_url.replace('pages', 'pageFriend')
		let arr =  (res.target && res.target.id && res.target.id.split('_'))|| []
		
		if ( arr[0]== "share") {
			data = app.shareInit('pageFriend', 'userDetail/userDetail');
			data.share_true_url = data.share_true_url.replace('pages', 'pageFriend')
			data.share_true_url = data.share_true_url + '&dId=' + arr[1]
			
			let list = that.data.list
			let index = arr[2]
			list[index].share_num = list[index].share_num*1 + 1
			that.setData({
				list: list
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/addShareLog',
				data: {
					shop_id: wx.getStorageSync('watch_shop_id'),
					user_id: wx.getStorageSync('user_id'),
					share_url: "/pageFriend/pageFriend/dynamicDetail/dynamicDetail",
					module:"pageFriend",
					controller:"pageFriend",
					action:"dynamicDetail",
					share_type:1, //1:朋友,2:朋友圈,3:qq,4:微博
					user_dynamic_id: arr[1]
					// page_no: that.data.page_no,
					// page_num: that.data.page_num,
				},
				success: function(ress) {
				}
			})
			
		}
		
		console.log('分享数据：');
		console.log(data.share_true_url);
		return {
			title: '',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url
		}
	}, //end 分享接口
})
