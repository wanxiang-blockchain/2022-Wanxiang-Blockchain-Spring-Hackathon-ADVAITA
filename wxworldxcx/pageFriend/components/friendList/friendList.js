var util = require('../../../utils/util.js');
var cnchar = require('../../cnchar.min.js');
Component({
	data: {
		isLoad: false,
		StatusBar: '',
		hidden: true,
		listCurID: '',
		demoList:[{
			"userid": "",
			"name": "晓锋",
			"user_id": "0",
			"thumb_avatar": "https://wework.qpic.cn/wwhead/duc2TvpEgSQO4BpE0WZSZictNwhiciaUYVgiawnK7nnbvXrvRVsUCmCsUnpib1rSEEcH9ewj1BKic7CMo/100",
			"mobile": "186****9123",
			"spell": "AJ"
		}, {
			"userid": "",
			"name": "llium.",
			"user_id": "",
			"thumb_avatar": "https://wework.qpic.cn/bizmail/krPxCyvrRGnQhNCrKQugNvpvDAQKe9wUicPuT4dibFfEevVqG9H0swpQ/100",
			"mobile": "138****4583",
			"spell": "R"
		}, {
			"userid": "",
			"name": "米粒",
			"user_id": "",
			"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
			"mobile": "199****7684",
			"spell": "A"
		}],
		list: [],
		groupList: [],
		listRight: [],
		listCur: '',
		name: '',
		boxTop: 0,
		boxBottom: 0,
		itemHeight:16,
	},
	attached: function() {
		var that = this
		let list = [{}];
		for (let i = 0; i < 26; i++) {
			list[i] = {};
			list[i].name = String.fromCharCode(65 + i);
		}
		list[26] = {};
		list[26].name = '#';
		that.setData({
			listRight: list,
			listCur: list[0]
		})
			let user = wx.getStorageSync('user');
			// if (user.length > 0) {
			// 	that.getGroup(user);
			// } else {
				that.getCourseInfo();
			// }
			setTimeout((item)=>{
				wx.createSelectorQuery()
				.in(that)
				.select('.indexBar-box')
				.boundingClientRect(function(res) {
					that.setData({
						boxTop: res.top,
						boxBottom: res.bottom
					})
				})
				.exec();
				wx.createSelectorQuery()
				.in(that)
				.select('.indexBar-item')
				.boundingClientRect(function(res) {
					that.setData({
						itemHeight: res.height,
					})
				})
				.exec();
			},1000)
			
	},
	methods: {
		InputFocus() {},
		goDetail(e) {
			let lable = e.currentTarget.dataset.lable
			let num = e.currentTarget.dataset.num
			// wx.navigateTo({
			// 	url: '/pageFriend/pageFriend/userDetail/userDetail?userId=123'
			// });
			// wx.navigateTo({
			// 	url: '/pageFriend/pageFriend/groupDetail/groupDetail?userId=123'
			// });
			let selectArr = []
			let data = this.data.list.map((item, index) => {
				if(item[1].length>0){
					item[1].forEach((items,sub)=>{
						if(item[0] == lable && num == sub){
							items.active = !items.active
						}
						if(items.active){
							selectArr.push(items)
						}
					})
				}
				return item
			});
			this.setData({
				list: data
			})
			this.triggerEvent("goDetail",selectArr);
		},
		goSearch() {
		},
		getGroup(user) {
			let obj = {};
			user.forEach(item => {
				obj[item[0]] = item[1];
			});
			this.setData({
				list: user,
				groupList: obj
			})
			
		},
		getCourseInfo() {
			let list = {};
			for (let i = 0; i < 26; i++) {
				let name = String.fromCharCode(65 + i);
				list[name] = [];
			}
			list['other'] = [];
			let arr = [{
				"userid": "",
				"name": "晓锋",
				"user_id": "0",
				"thumb_avatar": "https://wework.qpic.cn/wwhead/duc2TvpEgSQO4BpE0WZSZictNwhiciaUYVgiawnK7nnbvXrvRVsUCmCsUnpib1rSEEcH9ewj1BKic7CMo/100",
				"mobile": "186****9123",
				"spell": "AJ"
			},{
				"userid": "",
				"name": "晓锋2",
				"user_id": "0",
				"thumb_avatar": "https://wework.qpic.cn/wwhead/duc2TvpEgSQO4BpE0WZSZictNwhiciaUYVgiawnK7nnbvXrvRVsUCmCsUnpib1rSEEcH9ewj1BKic7CMo/100",
				"mobile": "186****9123",
				"spell": "AJ"
			}, {
				"userid": "",
				"name": "llium.",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/krPxCyvrRGnQhNCrKQugNvpvDAQKe9wUicPuT4dibFfEevVqG9H0swpQ/100",
				"mobile": "138****4583",
				"spell": "R"
			}, {
				"userid": "",
				"name": "llium23.",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/krPxCyvrRGnQhNCrKQugNvpvDAQKe9wUicPuT4dibFfEevVqG9H0swpQ/100",
				"mobile": "138****4583",
				"spell": "R"
			}, {
				"userid": "",
				"name": "米粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "去粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "去粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "去粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "去粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "去粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "团粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "团粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "团粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "团粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "团粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}, {
				"userid": "",
				"name": "团粒",
				"user_id": "",
				"thumb_avatar": "https://wework.qpic.cn/bizmail/5xNRyoYlMAOjtodQQVAxf7H9saar82FicW35yibwEfEib96AvvqXSUq2w/100",
				"mobile": "199****7684",
				"spell": "A"
			}]
			let data = arr.map((item, index) => {
				item.spell = item.name.spell('first', 'up');
				item.active = false
				let upLetter = item.spell.toUpperCase();
				let letter = upLetter.substr(0, 1);
				if (letter in list) {
					list[letter].push(item);
				} else {
					list['other'].push(item);
				}
				return item;
			});
			wx.setStorageSync('user', list);
			this.setData({
				initList: data,
				groupList: list,
				list:Object.entries(list)
			})
			
			// this.$Api.userList(data).then(res => {
			// 	this.isLoad = false;
			// 	if (res.error == 0) {
			// 		let list = {};
			// 		for (let i = 0; i < 26; i++) {
			// 			let name = String.fromCharCode(65 + i);
			// 			list[name] = [];
			// 		}
			// 		list['other'] = [];
			// 		let data = res.data.map((item, index) => {
			// 			item.spell = item.name.spell('first', 'up');
			// 			let upLetter = item.spell.toUpperCase();
			// 			let letter = upLetter.substr(0, 1);
			// 			if (letter in list) {
			// 				list[letter].push(item);
			// 			} else {
			// 				list['other'].push(item);
			// 			}
			// 			return item;
			// 		});
			// 		this.groupList = list;
			// 		this.initList = data;
			// 		this.list = Object.entries(list);
			// 		uni.setStorageSync('user', this.list);
			// 	} else {
			// 		this.list= []
			// 		this.groupList= []
			// 		uni.showToast({
			// 			title: res.msg,
			// 			icon: 'none',
			// 			duration: 2000
			// 		});
			// 	}
			// });
		},
		//获取文字信息
		getCur(e) {
			this.setData({
				hidden: false,
				listCur: this.data.listRight[e.target.id].name
			})
		},
		setCur(e) {
			this.setData({
				hidden: true,
				listCur: this.data.listCur
			})
		},
		//滑动选择Item
		tMove(e) {
			let y = e.touches[0].clientY,
				offsettop = this.data.boxTop,
				offsetBottom = this.data.boxBottom,
				that = this;
			//判断选择区域,只有在选择区才会生效
			if (y > offsettop && y < offsetBottom) {
				let num = parseInt((y - offsettop) / that.data.itemHeight);
				this.setData({
					listCur: num >= 26 ? '#' : that.data.listRight[num].name
				})
			}
		},
		
		//触发全部开始选择
		tStart(e) {
			this.setData({
				hidden: false
			})
			this.tMove(e);
		},
		
		//触发结束选择
		tEnd(e) {
			this.setData({
				hidden: true,
				listCurID:'indexes-'+(this.data.listCur == '#' ? 'other' : this.data.listCur)
			})
		},
		confirmOrder(){
			var that = this
			util.ajax({
				url: util.config('baseApiUrl') + 'Api/Orders/confirm',
				data: {
					user_id: wx.getStorageSync('user_id') || '',
					orders_id:that.data.orderList[that.data.orderIndex].orders_id
				},
				success: function(ress) {
					if (ress.error == 0) {
						that.cancel()
						that.getList()
						wx.showToast({
							title: '确认成功',
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
		
	}
})
