var util = require('../../../utils/util.js');
var config = require('../../../config.js');
var app = getApp();
const skinBehavior = require('../../../utils/skinBehavior.js');
Page({
	behaviors: [skinBehavior],
	data: {
		URL: 3,
		titleType: 2,
		bigType:2,
		topNum: 0,
		page_no: 1,
		page_num: 10,
		list: [],
		listMore: false,
		scrollIndex: 0,
		friendMask: false,
		addUserMask: false,
		authMask: false,
		friendList: [],
		friendpage_no: 1,
		friendMore: false,
		isShowFly:true,
		demoList: [{
				is_attent: 0,
				add_time: "1608610262",
				agree_num: "1",
				agree_state: "0",
				avatar_url: "https://i.2fei2.com/shop/logo/2020-08-12/17:34:33/5f33b7a911bb7.png",
				hug_num: "1",
				hug_state: "0",
				id: "14264",
				my_look_treport_auth: "2",
				nickname: "陈先生",
				shop_id: "25",
				cicleType : 'report',
				treport: {
					db_id: "705",
					treport_bind_user_db_id: "6477",
					deviceidentity: "863221040319426",
					count: "87",
					sleepqualiscore: 87
				},
				treport_id: "2856",
				timeCircle: '07-31',
				timeOnlyTimes: '14:10',
				starttime_text: '2020-07-31 14:10',
				dynamic_remark_list: []
			},
			{
				is_attent: 0,
				add_time: "1608610262",
				agree_num: "1",
				agree_state: "0",
				avatar_url: "https://i.2fei2.com/shop/logo/2020-08-12/17:34:33/5f33b7a911bb7.png",
				hug_num: "1",
				hug_state: "0",
				id: "14264",
				my_look_treport_auth: "2",
				nickname: "陈先生",
				cicleType : 'report',
				shop_id: "25",
				treport: {
					db_id: "702",
					treport_bind_user_db_id: "6474",
					deviceidentity: "863221040319426",
					count: "64",
					sleepqualiscore: 64
				},
				treport_id: "2856",
				timeCircle: '07-31',
				timeOnlyTimes: '14:10',
				starttime_text: '2020-07-31 14:10',
				dynamic_remark_list: []
			}
		],
		commentMask: false,
		
		topicList:[],
		historyList:[],
		showHelpAll:false,
		showInput:false,
		topicId:0,
		topicContent:''
	},
	onLoad: function(options) {
		var that = this
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		});
		// 公用设置参数
		app.commonInit(options, this, function(tokenInfo) {
			that.setData({
				bigType: that.data._GET.bigType || 2,
				titleType: that.data._GET.titleType || 2,
			})
			if (wx.getStorageSync('user_id')) {
				that.getIndex()
			}
			if(options?.showSearch == 1){
				that.showSearch()
			}

		}); //end 公用设置参数
	},
	onShow: function() {
		if (wx.getStorageSync('user_id')) {
			this.getIndex()
		}
	},
	showSearch(){
		if(this.data.showInput)return
		this.setData({
			showInput:true
		})
	},
	hideSearch(){
		this.setData({
			showInput:false,
			search:''
		})
	},
	getIndex(){
		if(this.data.bigType == 1){
			this.getTopic()
			this.getHistory()
			if(this.data.topicId!=0){
				this.getOfficeList()
			}
			
		}else if(this.data.bigType == 2){
			this.getFriend()
		}else if(this.data.bigType == 0){
			// 商城
		}
		this.treportList();
	},
	getHistory(){
		let history = wx.getStorageSync('historyList') || []
		this.setData({
			historyList: history
		})
	},
	delHistory(){
		wx.setStorageSync('historyList',[])
		this.setData({
			historyList: []
		})
	},
	getTopic() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/dynamicTopic',
			data: {
				type:1,
				page_no:1,
				page_num:100
			},
			success: function(ress) {
				if (ress.error == 0) {
					that.setData({
						topicList: ress.data
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
	triggleFly(e){
		this.setData({
			isShowFly: e.detail
		})
	},

	refreshComment(e) {
		this.refreshPage(e)
		this.triggleCommentMask()
	},
	longPressComment(e) {
		this.refreshPage(e)
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
	triggleCommentMask(e) {
		this.setData({
			commentMask: !this.data.commentMask,
		})
		if (e) {
			this.setData({
				commentInfo: e.detail || {}
			})
		}
	},
	goSaltDetail(e){
		let item = e.detail
		wx.navigateTo({
			url: '/pageFriend/pageFriend/dynamicDetail/dynamicDetail?dId='+item.id+'&type='+this.data.bigType
		})
	},
	changeInput(e){
		this.setData({
			search: e.detail.value || ''
		})	
	},
	goSearch(e){
		let item = e.currentTarget.dataset.item
		let type = e.currentTarget.dataset.type
		let arr = wx.getStorageSync('historyList') || []
		if(type == 1){
			// 直接搜
			arr.unshift(this.data.search)
			arr = arr.slice(0,10)
			wx.setStorageSync('historyList',arr)
		}else if(type == 2){
			// 搜历史
			this.setData({
				search: item
			})
		}else{
			// 搜话题
			this.setData({
				topicId: item && item.topic_id || 0,
				topicName: item && item.name || '',
				search: ''
			})
			this.getOfficeList()
		}
		this.setData({
			showInput:false,
			historyList: arr,
			searchType:type,
			page_no: 1
		})	
		this.treportList();
	},
	getOfficeList() {
		// 官方文章
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Clinic/homeopathySearch',
			data: {
				type:that.data.topicId,
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('shop_id') || '',
				
			},
			success: function(ress) {
				if (ress.error == 0) {
					let arr = ress.data.slice(0,5)
					let str = ''
					arr.forEach((item)=>{
						str+=item.symptom_ft+','+item.prescription+','
					})
					that.setData({
						topicContent: str
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
	
	getFriend() {
		var that = this;

		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/shareUser',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				share_user_id: that.data._GET.share_user_id || ''
			},
			success: function(ress) {

				if (ress.error == 0) {
					let reject = wx.getStorageSync('rejectList') || {}
					let isAuth = (that.data._GET.invite == 1) && that.data.userInfo.Wechat_xcxSetUser && (that.data._GET.share_user_id !=
						that.data.userInfo.Wechat_xcxSetUser.user_id) && (ress.data.share_user_auth_state == 0) && !reject[that.data
						._GET.inviteId + that.data._GET.share_user_id]
					that.setData({
						authMask: isAuth
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
	triggleFocus(msg) {
		let item = msg.detail.item
		let index = msg.detail.index
		// 关注
		var that = this;
		if (item.is_attent == 1) return
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/attentionUser',
			data: {
				user_id: wx.getStorageSync('user_id') || '',
				beattent_user_id: item.user_id || ''
			},
			success: function(ress) {
				if (ress.error == 0) {
					wx.showToast({
						title: '操作成功',
						icon: 'none',
						duration: 2000
					});
					let arr = that.data.list
					arr[index].is_attent = ress.data.collect_state ? 1 : 0
					that.setData({
						list: arr
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
	changeType(e) {
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		this.setData({
			titleType: type,
			page_no: 1,
			topNum: 0,
			list:[]
		})
		this.treportList();
	},
	changeBigType(e) {
		let type = e.target.dataset.type || e.currentTarget.dataset.type
		this.setData({
			bigType: type,
			page_no: 1,
			topNum: 0,
			list:[]
		})
		this.getIndex()
		// this.treportList();
	},
	hideFriendMask() {
		this.setData({
			friendMask: false
		})
	},
	showAddUser() {
		this.setData({
			addUserMask: true,
			friendMask: false
		})
	},
	showFriend() {
		this.setData({
			friendMask: true
		})
		this.treportUserList()
	},
	familyScrollLower() {
		if (this.data.friendMore) {
			let num = this.data.friendpage_no + 1
			this.setData({
				friendpage_no: num
			})
			this.treportUserList();
		}
	},
	treportUserList: function() {
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/treportUserList',
			data: {
				user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				is_hide_null_device: 1,
				page_num: 20, //把第几次加载次数作为参数
				page_no: that.data.friendpage_no, //返回数据的个数 
			},
			success: function(ress) {
				if (ress.error == 0) {
					// friendpage_no: 1,
					// friendMore: false,
					if (that.data.friendpage_no == 1) {
						ress.data.splice(0, 1)
					}
					let friendList = that.data.friendpage_no == 1 ? ress.data : that.data.friendList.concat(ress.data);

					that.setData({
						friendList,
						friendMore: !(friendList.length == ress.count - 1)
					})
					wx.setStorageSync('user_list', friendList)
				}
			}
		})
	},
	goDetail2(e) {
		let dev = e.target.dataset.dev || e.currentTarget.dataset.dev
		let id = e.target.dataset.id || e.currentTarget.dataset.id
		let bindid = e.target.dataset.bindid || e.currentTarget.dataset.bindid
		wx.navigateTo({
			url: '/pageWatch/pageWatch/treport/treport?example=1&DeviceIdentity=' + dev + '&id=' + id + '&bindid=' + bindid
		})
	},
	goDetail(e) {
		let auth = e.target.dataset.auth || e.currentTarget.dataset.auth
		if (auth == 2 || !auth) {
			let dev = e.target.dataset.dev || e.currentTarget.dataset.dev
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			let bindid = e.target.dataset.bindid || e.currentTarget.dataset.bindid
			wx.navigateTo({
				url: '/pageWatch/pageWatch/treport/treport?DeviceIdentity=' + dev + '&id=' + id + '&bindid=' + bindid
			})
		} else {
			wx.showToast({
				title: '暂无报告详情',
				icon: 'none',
				duration: 1000
			});
		}

	},
	getAutoplayState(index){
		let that = this
		let arr = that.data.list
		arr.forEach((t,i)=>{
			t.isScroll = true
			t.autoplay = i == index || i == (index + 1)
		})
		that.setData({
			scrollIndex: index,
			list: arr
		})
	},
	bindscroll: util.debounce(function(msg) {
		var that = this;
		setTimeout(() => {
			const query = wx.createSelectorQuery()
			query.selectAll('.circle-index').boundingClientRect()
			query.select('.scroll-h').boundingClientRect()
			query.exec(function(res) {
				let scrollTop = msg[0].detail.scrollTop
				let h = 0
				if(scrollTop == 0){
					that.getAutoplayState(0)
					return
				}
				res[0].forEach((item, index) => {
					if (scrollTop > h && scrollTop < h + item.height) {
						that.getAutoplayState(index)
					}
					h += item.height
				})
				
			})
		}, 10)

	}, 400),
	searchScrollLower(scroll) {
		if (this.data.listMore) {
			let num = this.data.page_no + 1
			this.setData({
				page_no: num
			})
			this.treportList();
		}
	},
	goUrl(e) {
		wx.navigateTo({
			url: e.target.dataset.url || e.currentTarget.dataset.url
		})
	},
	
	treportList(refreshIndex) {
		var that = this;
		let id = wx.getStorageSync('user_id') || ''
		if (!id) return
		that.setData({
			loading: true
		})
		let data = {
			shop_id: wx.getStorageSync('watch_shop_id') || '',
			user_id: id,
			page_num: that.data.page_num, //把第几次加载次数作为参数 
			page_no: that.data.page_no, //返回数据的个数 
		}
		if(that.data.bigType == 1){
			// 矿盐
			data.type = 'homeopathy'
			data.is_show_world = 1
			if(this.data.searchType == 1 || this.data.searchType == 2){
				// 打字搜索
				data.search_key = this.data.search || ''
			}else if(this.data.searchType == 3){
				data.topic_id = this.data.topicId || 0
			}
		}else if(that.data.bigType == 2){
			if (that.data.titleType == 0) {
				data.auth_type = 0
			} else if (that.data.titleType == 1) {
				data.auth_type = 2
			} else {
				data.is_show_world = 1
			}
			data.type = 'community,treport,goods'
		}else if(that.data.bigType == 0){
			data.type = 'goods'
			data.is_show_world = 1
		}
		
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/User/getUserFriendDynamic',
			data: data,
			success: function(ress) {
				that.setData({
					loading: false
				})
				if (ress.error == 0) {
					let data = ress.data.map((item, index) => {
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
					let list = []
					if (that.data.page_no == 1) {
						list = ress.data
					} else {
						list = that.data.list.slice(0, (that.data.page_no - 1) * 10)
						list = list.concat(ress.data)
					}

					that.setData({
						list,
						listMore: !(list.length == ress.count)
					})
				} else {
					that.setData({
						list: [],
						listMore: false
					})
					app.alert_s(ress.msg, that);
				}
			},
			error() {
				that.setData({
					loading: false
				})
			}
		})
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
					arr[index].agree_num = ress.data.agree_state ? (arr[index].agree_num * 1 + 1) : (arr[index].agree_num * 1 - 1)
					arr[index].agree_state = ress.data.agree_state ? 1 : 0
					that.setData({
						list: arr
					})
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})
	},
	hideAddUser() {
		this.setData({
			addUserMask: false
		})
	},
	hideAuthMask() {
		// 拒绝邀请
		let obj = wx.getStorageSync('rejectList') || {}
		obj[this.data._GET.inviteId + this.data._GET.share_user_id] = 1
		wx.setStorageSync('rejectList', obj)
		this.setData({
			authMask: false
		})
	},
	acceptAuth() {
		// 接受邀请
		this.setData({
			authMask: false
		})
		var that = this;
		util.ajax({
			url: util.config('baseApiUrl') + 'Api/Exercise/authTreportUser',
			data: {
				share_user_id: that.data._GET.share_user_id,
				treport_user_id: wx.getStorageSync('user_id'),
				shop_id: wx.getStorageSync('watch_shop_id'),
				name: that.data.userInfo.Wechat_xcxSetUser.nickname,
				auth_type: 2 // 授权类型，1:查看权限，2:查看管理权限
			},
			success: function(ress) {
				if (ress.error == 0) {
					app.alert_s('添加成功', that);
				} else {
					app.alert_s(ress.msg, that);
				}
			}
		})

	},
	changeHelp(){
		this.setData({
			showHelpAll: !this.data.showHelpAll
		})
	},
	
	// 分享接口
	onShareAppMessage: function(res) {
		var that = this
		var data = app.shareInit('pageFriend', 'friendCircle/friendCircle');
		data.share_true_url = data.share_true_url.replace('pages', 'pageFriend')
		if (res.target && res.target.id && res.target.id == "auth") {
			data.share_true_url = data.share_true_url + '&share_name=' + that.data.userInfo.Wechat_xcxSetUser.nickname +
				'&invite=1&inviteId=' + new Date().getTime()
		}
		let arr = (res.target && res.target.id && res.target.id.split('_')) || []
		if (arr[0] == "share") {
			data = app.shareInit('pageFriend', 'dynamicDetail/dynamicDetail');
			data.share_true_url = data.share_true_url.replace('pages', 'pageFriend')
			let index = arr[2]
			data.share_true_url = data.share_true_url + '&dId=' + arr[1] + '&id=' + that.data.list[index].user_id +
				'&userId=' + that.data.list[index].treport_id
			let list = that.data.list
			list[index].share_num = list[index].share_num * 1 + 1
			that.setData({
				list: list
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/addShareLog',
				data: {
					shop_id: wx.getStorageSync('watch_shop_id'),
					user_id: wx.getStorageSync('user_id'),
					share_url: "/pageFriend/pageFriend/dynamicDetail/dynamicDetail",
					module: "pageFriend",
					controller: "pageFriend",
					action: "dynamicDetail",
					share_type: 1, //1:朋友,2:朋友圈,3:qq,4:微博
					user_dynamic_id: arr[1]
					// page_no: that.data.page_no,
					// page_num: that.data.page_num,
				},
				success: function(ress) {}
			})

		}

		console.log('分享数据：');
		console.log(data.share_true_url);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url + '&type=' + this.data.tabNum,
			success: function(res) {
				//添加分享记录
				util.ajax({
					url: util.config('baseApiUrl') + 'Api/User/addShareLog',
					data: data,
					success: function(res) {
						console.log('成功分享记录');
						console.log(res);
					}
				})
			}
		}
	}, //end 分享接口
})
