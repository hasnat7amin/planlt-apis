module.exports = {
  //  event
  AddEvent: require("./event/add_event"),
  AddEventInvites: require("./event/add_event_invites"),
  AddEventDelegates: require("./event/add_event_delegates"),
  AddEventMoreInfo: require("./event/add_event_more_info"),
  GetEvents: require("./event/get_events"),
  SearchEvents: require("./event/search_events"),
  UpdateEvent: require("./event/update_event"),

  // event task
  AddTask: require("./event_tasks/add_task"),
  AddTaskItem: require("./event_tasks/add_task_item"),
  UpdateTask: require("./event_tasks/update_task"),
  UpdateTaskItem: require("./event_tasks/update_task_item"),

  // profile 
  ChangePassword: require("./profile/change_password"),
  PersonalInfo: require("./profile/personal_info"),
  GetPersonalInfo: require("./profile/get_personal_info"),
  ChangeImage: require("./profile/upload_image"),
  CreateSubscrption: require("./profile/create_subscription"),
  ConfirmSubscription: require("./profile/confirm_subscription"),
};
