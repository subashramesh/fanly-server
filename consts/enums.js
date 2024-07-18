class AccountVisibility {
    static public = 0;
    static private = 1;
    static closed = 2;
}

class NotificationType {
    static like = 0;
    static comment = 1;
    static follow = 2;
    static followRequest = 3;
    static mention = 4;
    static reply = 5;
    static commentLike = 6;
    static replyLike = 7;
    static storyLike = 8;
    static commentMention = 9;
    static replyMention = 10;
    static storyMention = 11;
    static postShared = 12;
    static suggestPeople = 13;
    static followAccepted = 14;
    static interest = 15;
    static collabRequest = 16;
    static collabAccepted = 17;
    static collabDeclined = 18;
    static react = 19;
    static live = 20;
    static tag = 21;
}
class InteractionType {
    static like = 0;
    static comment = 1;
    static follow = 2;
    static followRequest = 3;
    static mention = 4;
    static reply = 5;
    static commentLike = 6;
    static replyLike = 7;
    static storyLike = 8;
    static commentMention = 9;
    static replyMention = 10;
    static storyMention = 11;
    static postShared = 12;
    static suggestPeople = 13;
    static followAccepted = 14;
    static view = 15;
    static interest = 16;
    static collabRequest = 16;
    static collabAccepted = 17;
    static collabDeclined = 18;
    static react = 19;
}

class MediaType {
    static image = 0;
    static video = 1;
    static audio = 2;
    static document = 3;
    static gif = 4;
}

class AccountType {
    static personal = 0;
    static business = 1;
    static creator = 2;
}

class PostStatus {
    static published = 0;
    static draft = 1;
    static pending = 2;
    static archived = 3;
}

class PrivacyType {
    static public = 0;
    static private = 1;
    static closed = 2;
}

class AccountStatus {
    static active = 0;
    static inactive = 1;
    static blocked = 2;
    static deleted = 3;
}

class PostType {
    static media = 0;
    static real = 1;
    static tv = 2;
}

class ReportType {
    static user = 0;
    static post = 1;
    static comment = 2;
}

class ThreadType {
    static text = 0;
    static image = 1;
    static video = 2;
    static audio = 3;
    static document = 4;
    static location = 5;
    static contact = 6;
    static link = 7;
    static poll = 8;
    static voice = 9;
    static sticker = 10;
    static gif = 11;
    static post = 12;
    static status = 13;
    static system = 14;
    static channel = 15;
    static mention = 16;
    static react = 17;
}

// enum ThreadEventType {
//     numberChange,
//     missedCall,
//     createGroup,
//     addMember,
//     removeMember,
//     leaveGroup,
//     changeGroupAvatar,
//     changeGroupTitle,
//     changeGroupDescription,
//   }

class ThreadEventType {
    static numberChange = 0;
    static missedCall = 1;
    static createGroup = 2;
    static addMember = 3;
    static removeMember = 4;
    static leaveGroup = 5;
    static changeGroupAvatar = 6;
    static changeGroupTitle = 7;
    static changeGroupDescription = 8;
    static addAdmin = 9;
    static removeAdmin = 10;
    static declinedCall = 11;
    static changeWallpaper = 12;
    static callEnd = 13;
}

exports.ThreadEventType = ThreadEventType;
exports.ThreadType = ThreadType;
exports.NotificationType = NotificationType;
exports.ReportType = ReportType;
exports.InteractionType = InteractionType;
exports.AccountVisibility = AccountVisibility;