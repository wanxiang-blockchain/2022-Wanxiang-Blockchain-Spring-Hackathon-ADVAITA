var util = require('../../../utils/util.js');
var cnchar = require('../../cnchar.min.js');
Component({
	properties: {
		list: {
			type: Array,
			value: []
		},
		statusBarHeight: {
			type: Number,
			value: 20
		},
		navHeight: {
			type: Number,
			value: 44
		},
	},
	data: {
		addUserMask: false,
		friendMask: true,
		updateNum:0,
	},
	 observers:{
	    'list':function(num){
			this.setData({
				updateNum: this.data.updateNum + 1
			})
	    },
	  },
	attached: function() {
	},
	methods: {
		forbiddenBubble() {

		},
		searchScrollLower(){
			this.triggerEvent("familyScrollLower", "");
		},
		hideFriendMask() {
			this.triggerEvent("hideFriendMask", "");
		},
		showAddUser() {
			this.triggerEvent("showAddUser", "");
		},
		goUrl(e) {
			wx.navigateTo({
				url: e.target.dataset.url || e.currentTarget.dataset.url
			})
		},
	}
})
