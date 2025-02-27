export async function PushNotification(data: PushNotificationType) {
  var url = "https://api.onesignal.com/notifications";
  var header = {
    Authorization: `Basic ${process.env.ONE_SIGNAL_RESTKEY}`,
    accept: "application/json",
    "content-type": "application/json",
  };
  var body = JSON.stringify({
    include_player_ids: data.oneSignalId,
    app_id: process.env.ONE_SIGNAL_APPID?.trim(),
    contents: {
      en: data.message,
      id: data.message,
    },
  });
  console.log(body);

  try {
    var res = await fetch(url, {
      method: "POST",
      headers: header,
      body: body,
    });
    return res;
  } catch (error) {
    throw error;
  }
}
