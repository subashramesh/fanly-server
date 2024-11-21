const router = require('express').Router();
const handler = require('../handler/handler.js');
const project = require('../handler/project.js');
const team = require('../handler/team.js');
const mdm = require('../handler/mdm.js');
const user = require('../handler/user.js');
const chat = require('../handler/chat.js');
const notification = require('../handler/notification.js');
const group = require('../handler/group.js');
const auth = require('../middleware/auth.js');
const mutate = require('../middleware/mutate.js');
const call = require('../handler/call.js');
const contact = require('../handler/contact.js');
const status = require('../handler/status.js');
const post = require('../handler/post.js');
const feeds = require('../handler/feeds.js');
const locale = require('../handler/locale.js');
const session = require('../handler/session.js');
const authenticate = require('../handler/auth.js');
const privacy = require('../handler/privacy.js');
const highlight = require('../handler/highlight.js');
const hashtag = require('../handler/hashtag.js');
const channel = require('../handler/channel.js');
const collection = require('../handler/collection.js');
const live = require('../handler/live.js');
const element = require('../handler/element.js');
const device = require('../handler/device.js');
const data = require('../handler/data.js');
const livekit = require('../livekit/livekit.cjs');
const follow = require('../handler/follow.js');
const ayf = require('../ayf/route.js');
const search = require('../handler/search.js');
const verification = require('../handler/verification.js');
const suggest = require('../handler/suggest.js');
const eject = require('../handler/eject.js');
const coins = require('../handler/coins.js');
const achievement = require('../handler/achievment.js');
const star = require('../handler/star.js');
const places = require('../handler/places.js');

router.use('/nn', ayf.router);

router.get('/test', handler.test);
router.get('/test/otp', auth.validate, handler.testOTP);

router.get('/eject/:id', eject.eject);
router.post('/check_deleted', eject.getDeleted);

router.get('/lang', locale.getLocale);
router.post('/lang', locale.genLocale);
router.get('/business', data.business);
router.get('/privacy', auth.validate, privacy.get);

router.get('/suggest', auth.validate, suggest.suggest);

router.get('/verification/status', auth.validate, verification.status);
router.post('/verification/request', auth.validate, verification.request);

router.get('/achievement', auth.validate, achievement.getAchievements);

router.get('/devices', auth.validate, device.get);
router.get('/me', auth.validate, authenticate.me);
router.post('/device/:id/remove', auth.validate, device.remove);

router.post('/broadcast', auth.validate, channel.newBroadcast);
router.post('/broadcast/:id/update', auth.validate, channel.updateBroadcast);
router.post('/broadcast/:id/delete', auth.validate, channel.deleteBroadcast);
router.get('/broadcast', auth.validate, channel.getBroadcasts);

router.post('/elements', auth.validate, element.elements);
router.post('/elements/interact', auth.validate, element.interact);
router.get('/elements/:id/:type', element.get);

router.post('/star/add', star.addStar);
router.get('/star', star.getStars);
router.get('/star/list', star.getStarList);
router.get('/star/:id', star.getStar);
router.post('/star/banner/add', star.addBanner)

router.post('/star/admin/add', authenticate.makeAdmin)
router.post('/star/admin/remove', authenticate.removeAdmin)

router.get('/star/banner/get', star.getBanners)

router.post('/live', auth.validate, live.go);
router.get('/live', auth.validate, live.getLives);
router.post('/live/:id/join', auth.validate, live.join);
router.post('/live/:id/leave', auth.validate, live.leave);
router.post('/live/:id/stop', auth.validate, live.stop);
router.post('/live/:id/react', auth.validate, live.react);
router.post('/live/:id/comment', auth.validate, live.comment);
router.get('/live/:id/comments', auth.validate, live.comments);
router.get('/live/:id/members', auth.validate, live.members);

router.post('/auth/otp', authenticate.sendOTP);
router.post('/auth/phone', authenticate.phoneAuth);
router.post('/auth/password', authenticate.passwordAuth);
router.post('/auth/qr', authenticate.qrAuth);
router.post('/auth/qr/link', auth.validate, authenticate.qrAuthLink);
router.post('/account/change', auth.validate, authenticate.changeNumber);
router.post('/user/profile/update', auth.validate, authenticate.updateProfile);
router.post('/user/profile/available', auth.validate, authenticate.checkName);
router.post('/user/profile/delete', auth.validate, authenticate.deleteAccount);
router.post('/contact/sync', auth.validate, contact.sync);
router.post('/contact/unsync', auth.validate, contact.unSync);
router.get('/contact/fetch', auth.validate, contact.getContacts);
router.post('/get_users', auth.validate, chat.getUsers);
router.post('/user/:id/get', auth.validate, chat.getUser);
router.post('/username', auth.validate, chat.getUser);
router.get('/activity', auth.validate, notification.getActivities);
router.post('/activity/:id/seen', auth.validate, notification.seenActivity);
router.post('/notification', auth.validate, notification.notification);

router.post('/places/add', auth.validate, places.addPlace);
router.get('/places', auth.validate, places.getPlaces);
router.get('/places/:id', auth.validate, places.getPlace);

router.get('/coin/balance', auth.validate, coins.getCoinBalance);
router.get('/coin/history', auth.validate, coins.getCoinHistory);
router.get('/coin/leaderboard',auth.validate, coins.getRanking);

router.post('/collection', auth.validate, collection.createCollection);
router.post('/collection/:id/delete', auth.validate, collection.deleteCollection);
router.post('/collection/:id/add', auth.validate, collection.addToCollection);
router.post('/collection/:id/remove', auth.validate, collection.removeFromCollection);
router.get('/collections', auth.validate, collection.getCollections);

router.post('/channel', auth.validate, channel.createChannel);
router.post('/channel/:id/update', auth.validate, channel.updateChannel);
router.get('/channels', auth.validate, channel.getChannels);
router.get('/channels/my', auth.validate, channel.getMyChannels);
router.get('/channels/map', auth.validate, channel.getChannelsMap);
router.get('/channels/following', auth.validate, channel.getFollowedChannels);
router.post('/channel/:id/follow', auth.validate, channel.followChannel);
router.post('/channel/:id/unfollow', auth.validate, channel.unfollowChannel);
router.post('/channel/:id/delete', auth.validate, channel.deleteChannel);

router.get('/session/:id', auth.validate, session.get)
router.post('/sessions', auth.validate, session.all)
router.post('/session', auth.validate, session.update)
router.post('/keynote', auth.validate, session.keynote)
router.post('/eject', auth.validate, session.eject)
router.get('/counter', auth.validate, session.counter)

router.get('/feeds/:type', auth.validate, feeds.feeds);
router.get('/search/:type', auth.validate, search.search);

router.post('/user/:id/follow', auth.validate, follow.follow);
router.post('/user/:id/unfollow', auth.validate, follow.unfollow);

router.post('/user/:id/subscribe', auth.validate, follow.subscribe);
router.post('/user/:id/unsubscribe', auth.validate, follow.unsubscribe);

router.get('/user/:id/followers', auth.validate, follow.followers);
router.get('/user/:id/followings', auth.validate, follow.followings);
router.get('/user/:id/mutuals', auth.validate, follow.mutuals);
router.post('/user/:id/accept', auth.validate, follow.accept);
router.post('/user/:id/reject', auth.validate, follow.reject);
router.post('/user/:id/remove', auth.validate, follow.remove);

router.post('/user/:id/message', auth.validate, follow.messageRequest);
router.post('/user/:id/message/accept', auth.validate, follow.acceptMessageRequest);
router.post('/user/:id/message/reject', auth.validate, follow.rejectMessageRequest);


router.get('/user/:id/posts', auth.validate, feeds.userPosts);
router.get('/user/:id/posts/members', auth.validate, feeds.userMembersPosts);
router.get('/user/:id/posts/tagged', auth.validate, feeds.userTaggedPosts);
router.get('/user/:id/reels', auth.validate, feeds.userReels);
router.post('/user/:id/block', auth.validate, feeds.block);
router.post('/user/:id/unblock', auth.validate, feeds.unblock);
router.post('/user/recovery', auth.validate, authenticate.updateRecovery);
router.post('/user/privacy', auth.validate, authenticate.updatePrivacy);

router.post('/highlight', auth.validate, highlight.create);
router.get('/highlight/:id', auth.validate, highlight.getShareableHighlight);
router.post('/highlight/:id/delete', auth.validate, highlight.delete);

router.get('/user/:id/highlight', auth.validate, highlight.get);

router.get('/hashtag/:tag/posts/:type', auth.validate, hashtag.posts);

router.get('/archive/status', auth.validate, highlight.getStatusArchive);
router.get('/archive/post', auth.validate, post.archived);

router.post('/post', auth.validate, post.createPost);
router.get('/saved', auth.validate, feeds.getSaved);
router.post('/post/:id/update', auth.validate, post.updatePost);
router.post('/post/:id/like', auth.validate, feeds.likePost);
router.post('/post/:id/react', auth.validate, feeds.reactPost);
router.post('/post/:id/unreact', auth.validate, feeds.unReactPost);
router.post('/post/:id/interested', auth.validate, feeds.interested);
router.post('/post/:id/not_interested', auth.validate, feeds.notInterested);
router.get('/post/:id', post.getSharaeablePost); //auth.validate,
router.post('/post/:id/view', auth.validate, feeds.viewPost);
router.post('/post/:id/unlike', auth.validate, feeds.unlikePost);
router.post('/post/:id/save', auth.validate, feeds.savePost);
router.post('/post/:id/un_save', auth.validate, feeds.unSavePost);
router.post('/post/:id/comment', auth.validate, feeds.commentPost);
router.get('/post/:id/likes', auth.validate, feeds.getLikes);
router.get('/post/:id/reactions', auth.validate, feeds.getReactions);
router.get('/post/:id/interests', auth.validate, feeds.getInterests);
router.get('/post/:id/comments', auth.validate, feeds.getComments);
router.get('/post/:id/comments/stars', auth.validate, feeds.getStarComments);
router.post('/post/:id/delete', auth.validate, feeds.deletePost);
router.post('/post/:id/g/:s', auth.validate, post.state);

router.post('/collab/:id/:type', auth.validate, feeds.respondCollab);

router.post('/comment/:id/delete', auth.validate, feeds.deleteComment);
router.post('/comment/:id/like', auth.validate, feeds.likeComment);
router.post('/comment/:id/unlike', auth.validate, feeds.unlikeComment);
router.post('/comment/:id/reply', auth.validate, feeds.replyComment);
router.get('/comment/:id/likes', auth.validate, feeds.getCommentLikes);
router.get('/comment/:id/replies', auth.validate, feeds.getReplies);

router.post('/reply/:id/delete', auth.validate, feeds.deleteReply);
router.post('/reply/:id/like', auth.validate, feeds.likeReply);
router.post('/reply/:id/unlike', auth.validate, feeds.unlikeReply);
router.get('/reply/:id/likes', auth.validate, feeds.getReplyLikes);

router.post('/chat/token', chat.generateToken);
router.post('/upload', auth.validate, handler.upload);
router.post('/public/upload', handler.upload);
router.post('/chat/update_fcm', auth.validate, chat.updateFCM);
router.post('/chat/update_pushkit', auth.validate, chat.updatePushKit);
router.post('/chat/update_pref', auth.validate, chat.updatePref);
router.post('/chat/message', auth.validate, chat.sendMessage);
router.post('/chat/:box/clear', auth.validate, chat.clearChat);

router.post('/chat/enter', auth.validate, chat.enter);
router.post('/chat/exit', auth.validate, chat.exit);

router.post('/thread/:id/vote', auth.validate, chat.vote);
router.post('/thread/:id/react', auth.validate, chat.react);
router.post('/thread/:id/star', auth.validate, chat.star);
router.post('/thread/:id/unstar', auth.validate, chat.unstar);
router.post('/thread/:id/delete', auth.validate, chat.deleteThread);
router.post('/thread/:id/edit', auth.validate, chat.editThread);
router.post('/thread/seen', auth.validate, chat.seen);
router.post('/thread/receive', auth.validate, chat.receive);
router.get('/chats', auth.validate, chat.sync);
router.get('/chats/box', auth.validate, chat.syncBox);
router.get('/livekit', auth.validate, livekit.getToken);

router.post('/status', auth.validate, status.createStatus);
router.post('/status/:id/view', auth.validate, status.statusSeen);
router.post('/status/:id/like', auth.validate, status.like);
router.get('/status/:id/likes', auth.validate, status.likes);
router.get('/status/:id/get', auth.validate, status.get);
router.get('/status/:id/views', auth.validate, status.views);
router.post('/status/:id/delete', auth.validate, status.delete);
router.post('/status/:id/unlike', auth.validate, status.unlike);
router.get('/status', auth.validate, status.getMyStatus);
router.get('/status/share/:id', auth.validate, status.getSharaeableStatus);
router.get('/status/friend', auth.validate, status.getFriendStatus);
router.get('/status/public', auth.validate, status.getPublicStatus);
router.get('/status/following', auth.validate, status.getFollowingStatus);
router.post('/status/privacy', auth.validate, status.updatePrivacy);

router.post('/call', auth.validate, call.call);
router.post('/call/:id/accept', auth.validate, call.accept);
router.post('/call/:id/reject', auth.validate, call.reject);
router.post('/call/:id/join', auth.validate, call.join);
router.post('/call/:id/invite', auth.validate, call.invite);
router.post('/call/:id/engage', auth.validate, call.engage);
router.post('/call/:id/shake', call.shake);
router.post('/call/:id/end', auth.validate, call.end);
router.post('/call/:id/end/full', auth.validate, call.endFull);
router.get('/call/logs', auth.validate, call.logs);
router.get('/call/active', auth.validate, call.activeCalls);

router.post('/group/new', auth.validate, group.createGroup);
router.post('/group/:id/update', auth.validate, group.updateGroup);
router.post('/group/meet/challenge', auth.validate, group.meetChallenge);
router.post('/group/:id/request', auth.validate, group.requestGroup);
router.post('/group/:id/requests', auth.validate, group.getRequests);
router.post('/request/:id/accept', auth.validate, group.acceptRequest);
router.post('/request/:id/decline', auth.validate, group.declineRequest);
router.post('/group/:id/leave', auth.validate, group.leaveGroup);
router.post('/group/:id/delete', auth.validate, group.deleteGroup);

router.post('/:type/login', user.login);
router.post('/:type/signup', user.signup);

router.post('/admin/project/category', auth.validate, mutate.mutate, project.category);
router.get('/admin/project/category', auth.validate, project.getCategories);
router.get('/admin/project/template', auth.validate, project.getTemplates);
router.post('/admin/project/template', auth.validate, mutate.mutate, project.template);
router.post('/admin/project/template/:id/delete', auth.validate, project.deleteTemplate);

router.post('/team', auth.validate, mutate.mutate, team.team);
router.get('/team', auth.validate, team.getTeams);
router.get('/members', auth.validate, team.siteAccounts);

router.post('/project', auth.validate, mutate.mutate, project.project);
router.get('/project', auth.validate, project.getProjects);
router.get('/project/:id/members', auth.validate, project.getMembers);

router.post('/project/:id/task', auth.validate, mutate.mutate, project.task);
router.get('/project/:id/tasks', auth.validate, project.getTasks);

router.post('/task/:id/comment', auth.validate, mutate.mutate, project.comment);
router.get('/task/:id/comments', auth.validate, project.getComments);

router.post('/mdm/enroll', mdm.enroll);
router.get('/mdm/devices', auth.validate, mdm.getDevices);

router.get('/mdm/apps', mdm.getApps);
router.post('/mdm/app', auth.validate, mutate.mutate, mdm.mutateApp);
router.post('/mdm/app/delete', auth.validate, mdm.deleteApp);
router.post('/mdm/sync/apps', auth.validate, mdm.syncApps);
router.post('/mdm/sync/usage', auth.validate, mdm.syncUsage);

router.get('/mdm/device/usage', auth.validate, mdm.getUsage);
router.get('/mdm/device/apps', auth.validate, mdm.getDeviceApps);
router.post('/mdm/device/update', auth.validate, mdm.updateDevice);

exports.router = router;