class ZeroChat extends ZeroFrame {
    addMessage (username, message) {
        var message_escaped = message.replace(/</g, "&lt;").replace(/>/g, "&gt;")  // Escape html tags in the message
        this.messages.innerHTML += "<li><b>" + username + "</b>: " + message_escaped + "</li>"
    }
    onOpenWebsocket () {
        this.messages = document.getElementById("messages")
        this.addMessage("System", "Ready to call ZeroFrame API!")
    }
}
page = new ZeroChat()

        this.cmd("siteInfo", {}, (site_info) => {
            if (site_info.cert_user_id)
                document.getElementById("select_user").innerText = site_info.cert_user_id
            this.site_info = site_info
        })

    selectUser () {
        this.cmd("certSelect", {accepted_domains: ["zeroid.bit"]})
        return false
    }
	
    onRequest (cmd, message) {
        if (cmd == "setSiteInfo") {
            if (message.params.cert_user_id)
                document.getElementById("select_user").innerHTML = message.params.cert_user_id
            else
                document.getElementById("select_user").innerHTML = "Select user"
            this.site_info = message.params  // Save site info data to allow access it later
			
            // Reload messages if new file arrives
            if (message.params.event[0] == "file_done")
                this.loadMessages()
        }
    }
	
    sendMessage () {
        if (!this.site_info.cert_user_id) {  // No account selected, display error
            this.cmd("wrapperNotification", ["info", "Please, select your account."])
            return false
        }
		
                    // Sign the changed file in our user's directory
                    this.cmd("siteSign", {"inner_path": content_inner_path}, (res) => {
                        this.loadMessages() // Reload messages

        // This is our data file path
        var data_inner_path = "data/users/" + this.site_info.auth_address + "/data.json"
        var content_inner_path = "data/users/" + this.site_info.auth_address + "/content.json"

        // Load our current messages
        this.cmd("fileGet", {"inner_path": data_inner_path, "required": false}, (data) => {
            if (data)  // Parse current data file
                data = JSON.parse(data)
            else  // Not exists yet, use default data
                data = { "message": [] }

            // Add the new message to data
            data.message.push({
                "body": document.getElementById("message").value,
                "date_added": Date.now()
            })

            // Encode data array to utf8 json text
            var json_raw = unescape(encodeURIComponent(JSON.stringify(data, undefined, '\t')))

            // Write file to disk
            this.cmd("fileWrite", [data_inner_path, btoa(json_raw)], (res) => {
                if (res == "ok") {
                    // Reset the message input
                    document.getElementById("message").value = ""
                    // Sign the changed file in our user's directory
                    this.cmd("siteSign", {"inner_path": content_inner_path}, (res) => {
                        // Publish to other users
                        this.cmd("sitePublish", {"inner_path": content_inner_path, "sign": false})
                    })
                } else {
                    this.cmd("wrapperNotification", ["error", "File write error: #{res}"])
                }
            })
        })

        return false
    }
	
    loadMessages () {
        this.cmd("dbQuery", ["SELECT * FROM message LEFT JOIN json USING (json_id) ORDER BY date_added DESC"], (messages) => {
            document.getElementById("messages").innerHTML = ""  // Always start with empty messages
            for (var i=0; i < messages.length; i++) {
                this.addMessage(messages[i].cert_user_id, messages[i].body)
            }
        })
    }