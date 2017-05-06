curl -X POST -H "Content-Type: application/json" -d '{
  "setting_type" : "call_to_actions",
  "thread_state" : "existing_thread",
  "call_to_actions":[


    {
      "type":"postback",
      "title":"Get Started",
      "payload":"GET_STARTED"
    }
    ,
    {
      "type":"web_url",
      "title":"Student Portal",
      "url":"https://myncistudent.ncirl.ie/"
    }
    ,
    {
      "type":"web_url",
      "title":"Moodle",
      "url":"https://moodle.ncirl.ie/my/"
    }
  ]
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token=EAAJ2aBX63yMBADtHALl6LFQZAw5cR6IpwThigahOYx8m2DqEkdHnsYBVi0fmrhQdJpswOgUbm45Gwu9ZBmoG3rjKOFEZAzd82G9bZCNDJgZAIrZCSxZCfcVZBKGMiHNfPmQj2BppZCmxJQjgUGBYhkLDLn69MqZBw3hWT0sWr0kMqYNgZDZD"
