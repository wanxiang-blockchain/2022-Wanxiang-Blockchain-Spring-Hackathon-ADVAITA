var util = require('../../../utils/util.js');
var app = getApp();
var config = require('../../../config.js');
Page({
	data: {
		type:1,
		showWechatMask:false,
		groupName:'',
		selectUserList:[]
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
				type: that.data._GET.type || 1
			})
		}); //end 公用设置参数
	},
	back(e){
		if(this.data.type !=1){
			this.setData({
				type: 1
			})
		}else{
			wx[e.detail]({
			    url: '/pages/index/index'
			})
		}
	},
	goDetail(arr){
		this.setData({
			selectUserList: arr.detail
		})
	},
	addGroup(){
		this.setData({
			type: 1
		})
		// 刷新
	},
	addUser(e){
		// e.target.dataset.type || e.currentTarget.dataset.type
		this.setData({
			type: 5
		})
	},
	switchName(){
		this.setData({
			type: 3,
			groupName:123
		})
	},
	changeName(e) {
		this.setData({
			groupName: e.detail.value || ''
		})
	},
	clearName(){
		this.setData({
			groupName: ''
		})
	},
	confirmName(){
		this.setData({
			type: 1
		})
		// 刷新
	},
	switchNotice(){
		this.setData({
			type: 4
		})
	},
	onShow: function() {
		
	},
	// 分享接口
	onShareAppMessage: function() {
		var data = app.shareInit('pageFriend', 'groupDetail/groupDetail');
		data.share_true_url = data.share_true_url.replace('pages','pageFriend')
		console.log('分享数据：');
		console.log(data.share_true_url+'&type='+this.data.tabNum);
		return {
			title: config.config().title||'',
			// imageUrl:'http://i.2fei2.com/5dc2a4e019549.png?imageView/1/w/500/h/400/interlace/1/q/100',
			path: data.share_true_url+'&type='+this.data.tabNum,
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
