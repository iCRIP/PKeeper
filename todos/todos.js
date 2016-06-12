Todos = new Mongo.Collection('todos');
Lists = new Mongo.Collection('lists');
Passwords = new Mongo.Collection('passwords');

//-------------------------------------------------------------------------
if (Meteor.isServer) {
	Meteor.publish('lists', function(){
	    var currentUser = this.userId;
	    return Lists.find({$or:[{createdBy: currentUser}, {addedUsers: currentUser} ] });
	});
	Meteor.publish('todos', function(currentList){
    	var currentUser = this.userId;
    	return Todos.find({listId: currentList })
	});
	Meteor.publish('passwords', function(currentList){
    	var currentUser = this.userId;
    	return Passwords.find({listId: currentList })
	});
	Meteor.publish('users', function() {
    	return Meteor.users.find({}, {fields:{profile: true}});
	});

// Methods 
	Meteor.methods({

	    'createNewList': function(listName){
		    var currentUser = Meteor.userId();
		    check(listName, String);
		    if(listName == ""){
		        listName = defaultName(currentUser);
		    }
		    var data = {
		        name: listName,
		        createdBy: currentUser
		    }
		    if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    return Lists.insert(data);
		},
		'createListItem': function(formData){
		    check(formData.name, String);
		    check(formData.list, String);
		    var currentUser = Meteor.userId();
		    var data = {
		        name: formData.name,
		        completed: false,
		        createdAt: new Date(),
		        createdBy: currentUser,
		        listId: formData.list,
		        difficulity: formData.todoDifficulity,
		        deadline: formData.todoDate
		    }
		    if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    return Todos.insert(data);
		},
		'updateListItem': function(documentId, todoItem){
		    check(todoItem, String);
		    var currentUser = Meteor.userId();
		    var data = {
		        _id: documentId,
		        createdBy: currentUser
		    }
		    if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Todos.update(data, {$set: { name: todoItem }});
		},
		'changeItemStatus': function(documentId, status){
		    check(status, Boolean);
		    var currentUser = Meteor.userId();
		    var data = {
		        _id: documentId
		    }
		    if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Todos.update(data, {$set: { completed: status }});
		},
		'changeItemDiff': function(documentId, diff){
			var currentUser = Meteor.userId();
			var data = {
		        _id: documentId,
		        createdBy: currentUser
		    }
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Todos.update(data, {$set: { difficulity: diff }});
		},
		'changeItemDeadline': function(documentId, deadlineDate){
			var currentUser = Meteor.userId();
			var data = {
		        _id: documentId,
		        createdBy: currentUser
		    }
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Todos.update(data, {$set: { deadline: deadlineDate }});
		},
		'removeListItem': function(documentId){
		    var currentUser = Meteor.userId();
		    var data = {
		        _id: documentId,
		        createdBy: currentUser
		    }
		    if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Todos.remove(data);
		},
		'addUserToProject': function(userId, documentId){
			var currentUser = Meteor.userId();
			var data = {
				_id: documentId
			}
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Lists.update(data,{
		    	$addToSet: {addedUsers: userId}
		    });

		},
		'delUserToProject': function(userId, documentId){
			var currentUser = Meteor.userId();
			var data = {
				_id: documentId
			}
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Lists.update(data,{
		    	$pull: {addedUsers: userId}
		    });

		},
		'removeProject': function( docId){
			var currentUser = Meteor.userId();
			var data = {
				_id: docId
			}
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Lists.remove(data);
		},
		'changeProjectName':function(docId, projectname){
			var currentUser = Meteor.userId();
			var data = {
				_id: docId
			}
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    Lists.update(data,{$set:{name: projectname}});
		},
		'addPassword':function(formData){
			var currentUser = Meteor.userId();
			var data = {
				passName: formData.passName,
				passLogin: formData.passLogin,
				passPass: formData.passPass,
				passUrl: formData.passUrl,
				passAddInfo: formData.passAddInfo,
				listId: formData.docId
			}
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
		    return Passwords.insert(data);
		},
		'removePassword':function(docId){
			var currentUser = Meteor.userId();
			var data = {
				_id: docId
			}
			if(!currentUser){
		        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
		    }
			Passwords.remove(data);
		}
	});
// Methods END
};



// ------------------------------------------------------------------------
if (Meteor.isClient) {
Template.userprof.helpers({
	userprof: function () {
		return Meteor.user();
	},
	useremail: function(){
		return Meteor.user().emails[0].address;
	}
});
Template.userlist.helpers({
	usersList: function(){
		var userCom = Meteor.user().profile.company;
		var z = this._id;
		var ids = Lists.find({_id: z}, {fields: {addedUsers:true}}).fetch()[0].addedUsers;
		var currentUser = Meteor.userId();
		if(ids){
			var x = Meteor.users.find({'_id': {$nin: ids}, 'profile.company': userCom}, {fields:{profile: true}}).fetch();
			for (var i = x.length - 1; i >= 0; i--) {
				x[i].currentList = z;
			}
		}else{
			var x = Meteor.users.find({'profile.company': userCom, '_id': {$ne: currentUser }}, {fields:{profile: true}}).fetch();
			for (var i = x.length - 1; i >= 0; i--) {
				x[i].currentList = z;
			}
		}
		return x;
	}
});
Template.addedUserList.helpers({
	addedToProjectUsers:function(){
		var userCom = Meteor.user().profile.company;
		var docId = this._id;
		var ids = Lists.find({_id: docId}, {fields: {addedUsers:true}}).fetch()[0].addedUsers;
		if(ids){
			var x = Meteor.users.find({'_id': {$in: ids},'profile.company':userCom}, {fields:{profile: true}}).fetch();
			for (var i = x.length - 1; i >= 0; i--) {
				x[i].currentList = docId;
			}
			return x;
		}
	}
});
Template.addedUserListItem.events({
	'click .remove-to-project': function(event){
		var id = this._id;
		var documentId = this.currentList;
		Meteor.call('delUserToProject', id, documentId);
	}
});
Template.userListItem.events({
	'click .add-to-project': function(event){
		var id = this._id;
		var documentId = this.currentList;
		Meteor.call('addUserToProject', id, documentId);
	}
});
Template.todos.helpers({
    'todo': function(){
    	var currentList = this._id;
    	var currentUser = Meteor.userId();
        return Todos.find({listId: currentList}, {sort: {createdAt: -1}});
    }
});
Template.passwords.helpers({
    'passwords': function(){
    	var currentList = this._id;
    	var currentUser = Meteor.userId();
        return Passwords.find({listId: currentList}, {sort: {createdAt: -1}});
    }
});
Template.passwords.events({
	'click .passRemove': function(event){
		event.preventDefault();
		var docId = this._id;
		Meteor.call('removePassword', docId);
	}
})
Template.addPassword.events({
	'submit form':function(event){
		event.preventDefault();

		var passName = $('[name="passName"]').val();
		var passLogin = $('[name="passLogin"]').val();
		var passPass = $('[name="passPass"]').val();
		var passUrl = $('[name="passUrl"]').val();
		var passAddInfo = $('[name="passAddInfo"]').val();
		var docId = this._id;
		var formData = {
			passName: passName,
			passLogin: passLogin,
			passPass: passPass,
			passUrl: passUrl,
			passAddInfo: passAddInfo,
			docId: docId
		};
		Meteor.call('addPassword', formData,function(error){
	        if(error){
	            console.log(error.reason);
	        } else {
	            $('[name="passName"]').val('');
				$('[name="passLogin"]').val('');
				$('[name="passPass"]').val('');
				$('[name="passUrl"]').val('');
				$('[name="passAddInfo"]').val('');
	        }
	    });
	}
})

//Add Todo -----------------------------------------------------------------
Template.addTodo.events({
	'submit form': function(event){
	    event.preventDefault();
	    var todoName = $('[name="todoName"]').val();
	    var currentList = this._id;
	    var deadlineVal = $('[name="deadline"]').val();
	    	if(deadlineVal == ''){
	    		deadline = new Date();
	    	}else{
	    		deadline = new Date(deadlineVal);
	    	}
	    var difficulity = $('[name="todoDifficulity"]').val();
	    	if(difficulity==''){
	    		difficulity = 'easy';
	    	}
	    var formData = {
	    	name: todoName,
	    	list: currentList,
	    	todoDate: deadline,
	    	todoDifficulity: difficulity
	    }
	    Meteor.call('createListItem', formData, function(error){
	        if(error){
	            console.log(error.reason);
	        } else {
	            $('[name="todoName"]').val('');
	        }
	    });
	}
});
Template.addTodo.onRendered(function(){
	this.$('[name="deadline"]').datetimepicker({
		lang:'ru',
		minDate: 0,
		format:'DD.MM.YYYY h:mm a',
  		formatTime:'h:mm a',
  		formatDate:'DD.MM.YYYY'

	});
});
//Delete Todo

Template.todoItem.events({
	'click .deleteTodo':function(event){
		event.preventDefault();
		var documentId = this._id;
		Meteor.call('removeListItem', documentId);	
		
	},
	'keyup [name="todoItem"]':function(event){
		if(event.which == 11 || event.which == 27){
			$(event.target).blur();
		}else{
			var documentId = this._id;
			var todoItem = $(event.target).val();
			Meteor.call('updateListItem', documentId, todoItem);
		}
	},
	'change [name="todoCheck"]':function(event){
		var documentId = this._id;
		var isCompleted = this.completed;
		if(isCompleted){
        	Meteor.call('changeItemStatus', documentId, false);
	    } else {
	        Meteor.call('changeItemStatus', documentId, true);
	    }
	},
	'change [name="todoItemDifficulity"]': function(){
		var documentId = this._id;
		var diff = $(event.target).val();
		Meteor.call('changeItemDiff', documentId, diff);
	},
	'blur [name="todoItemDeadline"]': function(){
		var documentId = this._id;
		var deadlineVal = $(event.target).val();
	    	if(deadlineVal == ''){
	    		deadlineDate = new Date();
	    	}else{
	    		deadlineDate = new Date(deadlineVal);
	    	}
		Meteor.call('changeItemDeadline', documentId, deadlineDate);
	}

});
Template.todoItem.onRendered(function(){
	this.$('[name="todoItemDeadline"]').datetimepicker({
		lang:'ru',
		minDate: 0,
		format:'DD.MM.YYYY h:mm a',
  		formatTime:'h:mm a',
  		formatDate:'DD.MM.YYYY'

	});
	var diff = this.$('[name="hiddenDifficulity"]').val();
	this.$('option[value="'+diff+'"]').attr('selected', 'selected');
});
Template.todoItem.helpers({
	'checked' :function(){
		var isCompleted = this.completed;
		if(isCompleted){
			return "checked";
		}else{
			return "";
		}
	},
	'disabled': function(){
		var isCompleted = this.completed;
		var currentUser = Meteor.userId();
		var creator = this.createdBy;
		if(isCompleted || (currentUser != creator)){
			return "disabled";
		}else{
			return "";
		}
	},
	'deadlineDate': function(){
		function pad(n, width, z) {
		  z = z || '0';
		  n = n + '';
		  widthParse = parseInt(width)
		  return n.length >= widthParse ? n : new Array(widthParse - n.length + 1).join(z) + n;
		}
		var thisDate = this.deadline;
		return ''+pad((parseInt(thisDate.getMonth())+1), 2)+'/'+pad(thisDate.getDate(),2)+'/'+thisDate.getFullYear()+' '+pad(thisDate.getHours(), 2)+':'+pad(thisDate.getMinutes(),2);
	}
});
Template.todosCount.helpers({
	'totalTodos':function(){
		var currentList = this._id;
		return Todos.find({listId: currentList}).count();
	},
	'completedTodos':function(){
		var currentList = this._id;
		return Todos.find({completed: true, listId: currentList}).count();
	}
});
Template.stat.helpers({
	'totalTodos':function(){
		var currentList = this._id;
		var todos = Todos.find({listId: currentList}).fetch();
		var totalCount = Todos.find({listId: currentList}).count();
		var easyCount = Todos.find({listId: currentList, difficulity: 'easy'}).count();
		var mediumCount = Todos.find({listId: currentList, difficulity: 'medium'}).count();
		var hardCount = Todos.find({listId: currentList, difficulity: 'hard'}).count();
		var all = {
			total: totalCount,
			easy: easyCount,
			medium: mediumCount,
			hard: hardCount,
		}
		return all;
	},
	'completedTodos':function(){
		var currentList = this._id;
		var totalCount = Todos.find({completed: true, listId: currentList}).count();
		var easyCount = Todos.find({completed: true, listId: currentList, difficulity: 'easy'}).count();
		var mediumCount = Todos.find({completed: true, listId: currentList, difficulity: 'medium'}).count();
		var hardCount = Todos.find({completed: true, listId: currentList, difficulity: 'hard'}).count();
		var all = {
			total: totalCount,
			easy: easyCount,
			medium: mediumCount,
			hard: hardCount,
		}
		return all;
	},
	'notcompletedTodos':function(){
		var currentList = this._id;
		var totalCount = Todos.find({completed: false, listId: currentList}).count();
		var easyCount = Todos.find({completed: false, listId: currentList, difficulity: 'easy'}).count();
		var mediumCount = Todos.find({completed: false, listId: currentList, difficulity: 'medium'}).count();
		var hardCount = Todos.find({completed: false, listId: currentList, difficulity: 'hard'}).count();
		var all = {
			total: totalCount,
			easy: easyCount,
			medium: mediumCount,
			hard: hardCount,
		}
		return all;
	}
});

//Lists
Template.addList.events({
	'submit form': function(event){
	    event.preventDefault();
	    var listName = $('[name=listName]').val();
	    Meteor.call('createNewList', listName, function(error, results){
	        if(error){
	            console.log(error.reason);
	        } else {
	            Router.go('listPage', { _id: results });
	            $('[name=listName]').val('');
	        }
	    });
	}
});

Template.listOfList.helpers({
	'list':function(){
		var currentUser = Meteor.userId();
		return Lists.find({$or: [{createdBy: currentUser}, {addedUsers: currentUser}]}, {sort:{name: 1},limit:20});
	}
});
Template.listOfList.events({
	'click .deleteProject': function(event){
		var listId = this._id;
		var result = confirm("Вы уверены что хотите удалить проект?");
		if(result){
			Meteor.call('removeProject', listId);
		}
	}
});
Template.listPage.events({
	'blur .project-name': function(event){
		var docId = this._id;
		var projectname = $(event.target).val();
		Meteor.call('changeProjectName', docId, projectname);
	}
})
//list end




//authentication

$.validator.setDefaults({
    rules: {
        email: {
            required: true,
            email: true
        },
        password: {
            required: true
        }
    },
    messages: {
        email: {
            required: "You must enter an email address.",
            email: "You've entered an invalid email address."
        },
        password: {
            required: "You must enter a password."
        }
    }
});


Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        
    }
});
Template.register.onRendered(function(){
	$('.register').validate({
		submitHandler: function(event){
			var email = $('[name=email]').val();
        	var password = $('[name=password]').val();
        	var userName = $('[name=firstName]').val();
        	var userSecondName = $('[name=surName]').val();
        	var userCompany = $('[name=company]').val();
        	var userPosition = $('[name=position]').val();
        	Accounts.createUser({
            	email: email,
            	password: password,
            	profile: {
            		firstname: userName,
            		secondname: userSecondName,
            		company: userCompany,
            		position: userPosition,
            		companyOwner: true
            	}
        	}, function(error){
	        	if(error){
	        		if(error.reason == "Email already exists."){
				        validator.showErrors({
				            email: "That email already belongs to a registered user."   
				        });
				    }
	        		
	        	}else{
	        		Router.go('home');
	        	}
        	});
		}
	});
});
Template.login.onRendered(function(){
    $('.login').validate({
    	submitHandler: function(event){
    		var email = $('[name=email]').val();
        	var password = $('[name=password]').val();
        	Meteor.loginWithPassword(email, password, function(error){
	        	if(error){
	        		console.log(error.reason);
	        		if(error.reason == "User not found"){
				        validator.showErrors({
				            email: error.reason    
				        });
				    }
				    if(error.reason == "Incorrect password"){
				        validator.showErrors({
				            password: error.reason    
				        });
				    }
	        	}else{
	        		var currentRoute = Router.current().route.getName();
			        if(currentRoute == "login"){
			            Router.go("home");
			        }
	        	}
        	});
    	}
	});
});
Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        
    }
});
// authentication END
//navigation rules
Template.navigation.events({
	'click a': function(event){
		
		$(event.target).parent().siblings().find('a').removeClass('active');
		$(event.target).addClass('active');
	},
    'click .logout': function(event){
    	event.preventDefault();
        Meteor.logout();
        Router.go('login');
    },
    'click .passwords-link':function(event){
    	event.preventDefault();
    	Router.go('passwords',{ _id: this._id });
    },
    'click .todos-link':function(event){
    	event.preventDefault();
    	Router.go('todos',{ _id: this._id });
    }
});
//--Client end
};

