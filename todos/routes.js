Router.configure({
	layoutTemplate: 'main'
});
Router.route('/register',{
	template:'register',
	name:'register'
});
Router.route('/login',{
	template:'login',
	name:'login'
});
Router.route('/',{
	template: 'home',
	name: 'home',
	subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList) ]
	}
});
Router.route('/list/:_id/userlist',{
	name: 'userlist',
	template: 'listPage',
	yieldTemplates: {
		'userlist': {to: 'rightBar'}
	},
	data: function(){
		var currentUser = Meteor.userId();
		var currentList = this.params._id;
		return Lists.findOne({ $or:[{_id: currentList,addedUsers: currentUser}, {_id: currentList,createdBy:currentUser}] });
	},
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    },
    waitOn: function () {
		return [Meteor.subscribe('users')];
	},
    subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList) ]
	}
});
Router.route('/list/:_id/userprof',{
	name: 'userprof',
	template: 'listPage',
	yieldTemplates: {
		'userprof': {to: 'rightBar'}
	},
	data: function(){
		var currentUser = Meteor.userId();
		var currentList = this.params._id;
		return Lists.findOne({ $or:[{_id: currentList,addedUsers: currentUser}, {_id: currentList,createdBy:currentUser}] });
	},
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    },
    subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList) ]
	}
});
Router.route('/list/:_id',{
	name: 'listPage',
	template: 'listPage',
	data: function(){
		var currentUser = Meteor.userId();
		var currentList = this.params._id;
		return Lists.findOne({ $or:[{_id: currentList,addedUsers: currentUser}, {_id: currentList,createdBy:currentUser}] });
	},
	onBeforeAction: function(){
        var currentUser = Meteor.userId();

        if(currentUser){
        	var active = $('.navigation .active');
        	if(active.hasClass('passwords-link')){
				this.render('passwords',{to:'rightBar'});
        	}else if(active.hasClass('todos-link')){
        		this.render('todos',{to:'rightBar'});
        	}else{
        		$('.navigation a').removeClass('active');
        		$('.todos-link').addClass('active');
        		this.render('todos',{to:'rightBar'});
        	}
        	this.next()
        } else {
            this.render("login");
        }
    },

    subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList), Meteor.subscribe('passwords', currentList) ]
	}
});
Router.route('/list/:_id/todos',{
	name: 'todos',
	template: 'listPage',
	yieldTemplates: {
    	'todos': {to: 'rightBar'}
    },
	data: function(){
		var currentUser = Meteor.userId();
		var currentList = this.params._id;
		return Lists.findOne({ $or:[{_id: currentList,addedUsers: currentUser}, {_id: currentList,createdBy:currentUser}] });
	},
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    },
    subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList) ]
	}
});
Router.route('/list/:_id/passwords',{
	name: 'passwords',
	template: 'listPage',
	yieldTemplates: {
    	'passwords': {to: 'rightBar'}
    },
	data: function(){
		var currentUser = Meteor.userId();
		var currentList = this.params._id;
		return Lists.findOne({ $or:[{_id: currentList,addedUsers: currentUser}, {_id: currentList,createdBy:currentUser}] });
	},
	onBeforeAction: function(){
		$('.navigation a').removeClass('active');
        $('.passwords-link').addClass('active');
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    },
    onAfterAction: function(){
    	$('.navigation a').removeClass('active');
        $('.passwords-link').addClass('active');
    },
    subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList), Meteor.subscribe('passwords', currentList) ]
	}
});
Router.route('/list/:_id/stat',{
	name: 'stat',
	template: 'listPage',
	yieldTemplates: {
    	'stat': {to: 'rightBar'}
    },
	data: function(){
		var currentUser = Meteor.userId();
		var currentList = this.params._id;
		return Lists.findOne({ $or:[{_id: currentList,addedUsers: currentUser}, {_id: currentList,createdBy:currentUser}] });
	},
	onBeforeAction: function(){
        var currentUser = Meteor.userId();
        if(currentUser){
            this.next();
        } else {
            this.render("login");
        }
    },
    subscriptions: function(){
	    var currentList = this.params._id;
	    return [ Meteor.subscribe('lists'), Meteor.subscribe('todos', currentList) ]
	}
});

