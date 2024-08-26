const db = require('../service/chat/postgres')
const socket = require('./chat_socket.js')

const StatusPrivacyType = {
    myContacts: 0,
    myContactsExcept: 1,
    onlyShareWith: 2,
  };
  
  const SessionPrivacyType = {
    everyone: 0,
    myContacts: 1,
    myContactsExcept: 2,
    nobody: 3,
  };
  
  const SessionOnlinePrivacyType = {
    everyone: 0,
    sameAsSession: 1,
  };
  
  const AvatarPrivacyType = {
    everyone: 0,
    myContacts: 1,
    myContactsExcept: 2,
    nobody: 3,
  };
  
  const BioPrivacyType = {
    everyone: 0,
    myContacts: 1,
    myContactsExcept: 2,
    nobody: 3,
  };
  
  const GroupPrivacyType = {
    everyone: 0,
    myContacts: 1,
    myContactsExcept: 2,
  };

  function canViewAvatar(id, privacy) {
    if (!privacy) {
      return true; // Handle the case where avatar privacy data is not available.
    }
    let p = privacy[0]
  
    const privacyType = p.type;
  
    // Check if the user can view the avatar based on privacy settings
    switch (privacyType) {
      case AvatarPrivacyType.everyone:
        return true; // Everyone can view the avatar.
      case AvatarPrivacyType.myContacts:
        return true; // User's contacts can view the avatar.
      case AvatarPrivacyType.myContactsExcept:
        const excludedContacts = p.exclude || [];
        return !excludedContacts.includes(id); // Check if the user is excluded.
      case AvatarPrivacyType.nobody:
        return false; // Nobody can view the avatar.
      default:
        return false; // Handle the case of an unknown privacy type.
    }
  }
  function canViewStatus(id, privacy) {
    if (!privacy) {
      return true; // Handle the case where status privacy data is not available.
    }

    const privacyType = privacy[0].type;
  
    // Check if the user can view the status based on privacy settings
    switch (privacyType) {
      case StatusPrivacyType.myContacts:
        return true; // User's contacts can view the status.
      case StatusPrivacyType.myContactsExcept:
        const excludedContacts = privacy.exclude || [];
        return !excludedContacts.includes(id); // Check if the user is excluded.
      case StatusPrivacyType.onlyShareWith:
        const includedContacts = privacy.include || [];
        return includedContacts.includes(id); // Check if the user is included.
      default:
        return true; // Handle the case of an unknown privacy type.
    }
  }

  function canViewSession(id, privacy) {
    if (!privacy) {
        return true; // Handle the case where session privacy data is not available.
    }
    let p = privacy[0];
    const privacyType = p.type;
    // Check if the user can view the session based on privacy settings
    switch (privacyType) {
        case SessionPrivacyType.everyone:
            return true; // Everyone can view the session.
        case SessionPrivacyType.myContacts:
            return true; // User's contacts can view the session.
        case SessionPrivacyType.myContactsExcept:
            const excludedContacts = p.exclude || [];
            return !excludedContacts.includes(id); // Check if the user is excluded.
        case SessionPrivacyType.nobody:
            return false; // Nobody can view the session.
        default:
            return true; // Handle the case of an unknown privacy type.
    }
}


function canViewBio(id, privacy) {
    if (!privacy) {
        return true; // Handle the case where bio privacy data is not available.
    }
    let p = privacy[0];
    const privacyType = p.type;
    // Check if the user can view the bio based on privacy settings
    switch (privacyType) {
        case BioPrivacyType.myContacts:
            return true; // User's contacts can view the bio.
        case BioPrivacyType.myContactsExcept:
            const excludedContacts = p.exclude || [];
            return !excludedContacts.includes(id); // Check if the user is excluded.
        case BioPrivacyType.onlyShareWith:
            const includedContacts = p.include || [];
            return includedContacts.includes(id); // Check if the user is included.
        default:
            return true; // Handle the case of an unknown privacy type.
    }
}


function canViewGroup(id, privacy) {
    if (!privacy) {
        return true; // Handle the case where group privacy data is not available.
    }
    let p = privacy[0];
    const privacyType = p.type;
    // Check if the user can view the group based on privacy settings
    switch (privacyType) {
        case GroupPrivacyType.myContacts:
            return true; // User's contacts can view the group.
        case GroupPrivacyType.myContactsExcept:
            const excludedContacts = p.exclude || [];
            return !excludedContacts.includes(id); // Check if the user is excluded.
        default:
            return true; // Handle the case of an unknown privacy type.
    }
}

function canViewSessionOnline(id, privacy, ss) {
    if (!privacy) {
        return true; // Handle the case where session online privacy data is not available.
    }
    let p = privacy[0];
    const privacyType = p.type;
    // Check if the user can view the session online status based on privacy settings
    switch (privacyType) {
        case SessionOnlinePrivacyType.everyone:
            return true; // Everyone can view the session online status.
        case SessionOnlinePrivacyType.sameAsSession:
            return ss; // Match session privacy settings.
        default:
            return true; // Handle the case of an unknown privacy type.
    }
}

  
  
  
  
  

exports.get = async (req, res) => {
    // get data from status_privacy, avatar_privacy, session_privacy, bio_privacy, group_privacy tables
    // let id = req.params.id;


    try {
        let result = await db.select('privacy_view_n', {
            fields: ['*'],
            conditions: []
        })

        
        let y = req.user || {};
        let user = y.id || 1
        
        let data = converge(result, user)
        // console.log('act: ', data)
        return res.status(200).json({
            status: '200',
            message: 'Success',
            data: data
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: '500',
            message: 'Internal Server Error'
        });
    }
}

function converge(result, user) {
    let shutters = [];
        for(let i in result){
            let e = result[i]

            if(`${e.owner}` === `${user}`){
                continue;
            }
            
            let shutter = {
                id: e.owner,
                status: canViewStatus(user, e.status_privacy),
                avatar: canViewAvatar(user, e.avatar_privacy),
                session: canViewSession(user, e.session_privacy),
                about: canViewBio(user, e.bio_privacy),
                group: canViewGroup(user, e.group_privacy),
                online: canViewSessionOnline(user, e.session_online_privacy, canViewSession(user, e.session_privacy))
            }
            shutters.push(shutter)
        }
        return shutters
}

exports.converge = converge