var util = require('../../../utils/util.js');
//index.js
var that = undefined;
// var doommList = [];
var doommTop = [5, 10, 15, 10, 25, 30, 35, 40];
var i = 0;
// var ids = 0;
// var cycle = null //计时器

// 弹幕参数
class Doomm {
	constructor(text, top, left, color, time) { //内容，顶部距离，运行时间，颜色（参数可自定义增加）
		this.text = text;
		this.top = top;
		this.left = left;
		this.color = color;
		this.width = text.length * 16;
		this.time = time
		this.display = true;
		this.id = i++;
		this.endTime = 0
	}
}
// // 弹幕字体颜色
// function getRandomColor() {
// 	let rgb = []
// 	for (let i = 0; i < 3; ++i) {
// 		let color = Math.floor(Math.random() * 256).toString(16)
// 		color = color.length == 1 ? '0' + color : color
// 		rgb.push(color)
// 	}
// 	return '#' + rgb.join('')
// }

var doommData = [];
var barrage_style_obj = {};
var phoneWidth = 0;
var timers = [];
// var timer;
Component({
	properties: {
		item: {
			type: Object,
			value: {}
		},
		goods: {
			type: Array,
			observer: function(newVal, oldVal) {
				
			}
		},
		index: {
			type: Number,
			value: 0
		},
		auth: {
			type: Boolean,
			value: false
		},
		type: {
			type: String,
			value: "1" // 0商城1矿盐2手表
		},
		isFocus: {
			type: Boolean,
			value: false // 是否显示关注
		},
		
		myAvatar: {
			type: String,
			value: ''
		},
	},
	data: {
		info: {},
		dotIndex: 0,
		comment: '',
		commentAll:'',
		replayName: '',
		id: '',
		reuid: '',
		reid: '',
		textToast:'',
		// doommData: [{
		// 	text : '14555555555555555555555555',
		// 	top : 10,
		// 	width : 375,
		// 	color : '#fff',
		// 	display : true,
		// 	id : 0,
		// }],
		doommData: [],
		// doommList:[],
		cycle: null,
		timer: null,
		ids: 0,
		track: {},
		moodData: {},
		isFirst: 0,
		rankType:0,
		list:[],
		inputBottom:0,
		showAddComment:false,
		showReplyComment:false,
	},
	observers: {
		'item': function(num) {
			if(num){
					
				// tab切换
				let arr = []
				let topArr = []
				let normalArr = []
				// 专家作者置顶
				arr = Object.values(num.dynamic_remark_list).map((item)=>{
					item.active = false
					if(num.expert_user_id.indexOf(item.user_id) >-1){
						item.type = 'expert'
						topArr.unshift(item)
					}else if(item.user_id == num.user_id){
						item.type = 'author'
						normalArr.push(item)
					}else{
						item.type = 'normal'
						normalArr.push(item)
					}
					return item
				})
				let agreelist = topArr.concat(normalArr.sort((a,b)=> b.agree_num - a.agree_num))
				let timelist = [].concat(arr.sort((a,b)=> b.add_time - a.add_time))
				
				let remark_list = []
				let remark_list_time = []
				agreelist.forEach((item => {
					remark_list.push(item)
					if (item.son) {
						this.getRemarkList(remark_list, item)
					}
				}))
				timelist.forEach((item => {
					remark_list_time.push(item)
					if (item.son) {
						this.getRemarkList(remark_list_time, item)
					}
				}))
				// 默认
				num.dynamic_remark_list = remark_list;
				// 最新
				num.dynamic_remark_list_time = remark_list_time;
				
				// 文章内容
				const info1 = util.getArticle(num.message);
				num.detailInfo = info1
				// 评论是否只显示两条
				num.isCommentMore = true
				// 是否显示评论拥抱工具栏
				num.showReportMask = false
				this.setData({
					info: num,
					list:this.data.rankType == 0? num.dynamic_remark_list:num.dynamic_remark_list_time
				})
				
				// 判断动态文字长度
				// this.getTextHeight()
			}
		}
	},
	detached: function() {
		clearInterval(this.data.cycle)
		this.setData({
			ids: 0,
			doommData: []
		})
	},
	attached: function() {
		this.setData({
			user_id: wx.getStorageSync('user_id') || ''
		})
		let that = this
		// 获取屏幕的宽度
		wx.getSystemInfo({
			success: function(res) {
				phoneWidth = res.windowWidth
				that.setData({
					phoneWidth: res.windowWidth
				})
			}
		})
		
		that.sendScore()
	},
	methods: {
		hideMask(){
			this.setData({
				showReplyComment: false
			})
		},
		showMask(){
			this.setData({
				showAddComment: !this.data.showAddComment
			})
		},
		forbiddenBubble() {
		},
		//输入聚焦
		foucus(e) {
			var that = this;
			that.setData({
				inputBottom: e.detail.height
			})
		},
		//失去聚焦
		blur(e) {
			var that = this;
			that.setData({
				inputBottom: 0
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
		changeReportMask(){
			let num = this.data.info
			num.showReportMask = !num.showReportMask 
			this.setData({
				info: num
			})
		},
		goGoods(e){
			let item = e.target.dataset.item || e.currentTarget.dataset.item
			let id = item.artwork_id || ''
			wx.navigateTo({
				url: '/pageShop/pageShop/shopDetail/shopDetail?goods_id=' + item.goods_id+'&artwork_id='+id
			})
		},
		changeType(e){
			let type = e.target.dataset.type || e.currentTarget.dataset.type
			this.setData({
				list:type == 0? this.data.info.dynamic_remark_list:this.data.info.dynamic_remark_list_time,
				rankType:type
			})
		},
		
		triggleFly() {
			this.setData({
				isFirst: this.data.isFirst + 1
			})
			this.triggerEvent("triggleFly", !this.data.isShowFly);
		},
		
		getTextHeight() {
			let that = this
			setTimeout(() => {
				if (this.data.item.message && this.data.item.message.length > 52) {
					wx.createSelectorQuery()
						.in(that)
						.select('.msg-box')
						.boundingClientRect(function(res) {
							let data = that.data.info
							data.textOver = res.height > 48
							that.setData({
								info: data
							})
						})
						.exec();
				}
			}, 10)

		},
		triggleText() {
			if (!this.data.info.textOver) return
			let data = this.data.info
			data.textIsShow = !data.textIsShow
			this.setData({
				info: data
			})
		},
		triggleComment() {
			let data = this.data.info
			data.isCommentMore = !data.isCommentMore
			this.setData({
				info: data
			})
		},
		getRemarkList(arr, item) {
			item.son.forEach((items => {
				items.isReply = true
				items.replyName = item.userInfo.nickname
				arr.push(items)
				if (items.son) {
					this.getRemarkList(arr, items)
				}
			}))
		},
		delArticle(){
			var that = this;
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/deleteUserDynamic',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					dynamic_id: that.data.info.user_dynamic_id || '',
				},
				success: function(ress) {
					if (ress.error == 0) {
						wx.showToast({
							title: '删除成功',
							icon: 'none',
							duration: 2000
						});
						setTimeout(()=>{
							wx.reLaunch({
								url: "/pageFriend/pageFriend/friendCircle/friendCircle?bigType=1"
							})
						},1500)
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
		delComment(e) {
			var that = this;
			let cid = e.target.dataset.cid || e.currentTarget.dataset.cid
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/deleteRemarks',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					shop_id: wx.getStorageSync('watch_shop_id') || '',
					// remark:that.data.comment || '',
					remark_id: cid,
					user_dynamic_id: that.data.info.id || '',
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.triggerEvent("refreshPage", {
							index: that.data.index
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

		longPressComment(e) {
			let i = e.target.dataset.i || e.currentTarget.dataset.i
			let arr = this.data.list
			if (e.type == "longpress" && arr[i].user_id != this.data.user_id) {
				console.log('不是本人不能删除')
				return
			}
			arr.forEach((item, index) => {
				if (index == i) {
					// 同一个
					item.active = !item.active
				} else {
					item.active = false
				}
			})
			this.setData({
				list: arr
			})
		},
		changeIndex(e) {
			let index = e.detail
			this.setData({
				dotIndex: index || 0
			})
		},
		goComment(e) {
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			let index = e.target.dataset.index || e.currentTarget.dataset.index
			let items = e.target.dataset.iteminfo || e.currentTarget.dataset.iteminfo || ''
			let reuid = e.target.dataset.reuid || e.currentTarget.dataset.reuid
			let reid = e.target.dataset.reid || e.currentTarget.dataset.reid
			let name = (items && items.user_id != this.data.user_id) ? items.userInfo.nickname : ''
			let commentIndex = e.target.dataset.i || e.currentTarget.dataset.i
			let item = {
				id,
				index,
				reuid,
				reid,
				name,
				commentIndex
			}
			if (items && items.user_id == this.data.user_id) {
				// 本人的回复显示删除
				this.longPressComment(e)
			} else {
				let data = this.data.info
				if(data.showReportMask){
					data.showReportMask = false
				}
				data.commentMask = true
				this.setData({
					replayName: name || '',
					info: data,
					id,
					reuid,
					reid,
					commentIndex,
					showReplyComment:true
				})
				// this.triggerEvent("goComment", item);
			}
		},
		getInputText(e) {
			this.setData({
				comment: e.detail.value
			})
		},
		getInputTextAll(e) {
			this.setData({
				commentAll: e.detail.value
			})
		},
		//用户输入内容--提交输入
		submit(e) {
			var that = this;
			if (!that.data.comment && that.data.info.commentMask) {
				wx.showToast({
					icon: 'none',
					title: '请输入内容'
				})
				return;
			}
			if (!that.data.commentAll && !that.data.info.commentMask) {
				wx.showToast({
					icon: 'none',
					title: '请输入内容'
				})
				return;
			}
			let data = {
				user_id: wx.getStorageSync('user_id') || '',
				shop_id: wx.getStorageSync('watch_shop_id') || '',
				remark: that.data.info.commentMask?that.data.comment:that.data.commentAll,
				remark_id: '',
				user_dynamic_id: that.data.info.user_dynamic_id || '',
				remark_user_id: '',
			}
			if(that.data.info.commentMask){
				data.remark_id =  that.data.reid || ''
				data.remark_user_id =  that.data.reuid || ''
			}
			
			that.setData({
				loading: true
			})
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/addRemarks',
				data: data,
				success: function(ress) {
					that.setData({
						loading: false
					})
					if (ress.error == 0) {
						let data = that.data.info
						data.commentMask = false
						that.setData({
							comment: '',
							commentAll: '',
							reid: '',
							id: '',
							reuid: '',
							info: data,
							commentIndex:0,
							showAddComment:false,
							showReplyComment:false,
						})
						that.triggerEvent("refreshPage");
					} else {
						wx.showToast({
							title: ress.msg,
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
		changeDel() {
			let that = this;
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/deleteUserDynamic',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					dynamic_id: that.data.item.id || ''
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.triggerEvent("refreshPage", {
							index: that.data.index
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
		goComfort(e) {
			let id = e.target.dataset.id || e.currentTarget.dataset.id
			let index = e.target.dataset.index || e.currentTarget.dataset.index
			
			// let info = this.data.info
			// if(info.showReportMask){
			// 	info.showReportMask = false
			// 	this.setData({
			// 		info
			// 	})
			// }
			var that = this;
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/User/praiseRemark',
				data: {
					user_id: wx.getStorageSync('user_id'),
					dynamic_id: that.data.info.user_dynamic_id || '',
					remark_id: id || '',
				},
				success: function(ress) {
					if (ress.error == 0) {
						// let arr = that.data.list
						// arr[index].hug_num = ress.data.hug_state ? (arr[index].hug_num * 1 + 1) : (arr[index].hug_num * 1 - 1)
						// arr[index].hug_state = ress.data.hug_state ? 1 : 0,
						// arr[index].myHugList = ress.data.hug_state ? arr[index].myHugList = arr[index].myHugList.push(that.data.userInfo.Wechat_xcxSetUser.nickname):arr[index].myHugList.filter((x) => x !== that.data.userInfo.Wechat_xcxSetUser.nickname)
						// that.setData({
						// 	list: arr
						// })
						// that.refreshPage(item)
						that.triggerEvent("refreshPage", {
							index
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
		goDetail() {
			let userId = this.data.item.treport.bind_treport_user_table_id || ''
			wx.navigateTo({
				url: '/pageFriend/pageFriend/userDetail/userDetail?id=' + this.data.item.user_id + '&userId=' + userId
			})
		},
		goReportDetail(e) {
			if(this.data.auth || this.data.info.user_id == this.data.user_id){
				let dev = e.target.dataset.dev || e.currentTarget.dataset.dev
				let id = e.target.dataset.id || e.currentTarget.dataset.id
				let bindid = e.target.dataset.bindid || e.currentTarget.dataset.bindid
				wx.navigateTo({
					url: '/pageWatch/pageWatch/treport/treport?DeviceIdentity=' + dev + '&id=' + id + '&bindid=' + bindid
				})
			}
		},
		triggleFocus() {
			this.triggerEvent("triggleFocus", {
				index: this.data.index,
				item: this.data.item
			});
		},
	}
})
