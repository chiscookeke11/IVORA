# IVORA — Your AI Pay TV Assistant 📺🤖

IVORA is a next-generation voice assistant designed to help Pay TV customers (DStv, GOtv, and StarTimes) resolve decoder errors quickly and naturally. 

Instead of navigating frustrating "Press 1 for..." menus, you simply talk to Ivora just like you would talk to a friend. She listens, understands your problem, and guides you through the fix in real-time.

---

## 🚀 How It Works

1.  **Call**: Dial the support number from any phone.
2.  **Talk**: Explain your issue. Ivora understands both **Standard English** and **Pidgin English**.
3.  **Diagnose**: Give Ivora your Smartcard or IUC number. She instantly checks your account status to see if your subscription is active or expired.
4.  **Fix**: Ivora provides step-by-step instructions to clear the error on your screen (e.g., E16, E48-32, etc.).

## ✨ Key Features

*   **Zero Latency**: No "push-to-talk" delays. The conversation flows smoothly.
*   **Smart Recognition**: Automatically detects your service provider (DStv, GOtv, or StarTimes).
*   **Account Aware**: Knows your name and subscription due date to give personalized help.
*   **Human Fallback**: If the issue is too complex, Ivora can automatically transfer your call to a human agent.

---

## 🛠 For Testers & Developers

If you are a developer or a tester looking to run IVORA locally and see it in action, please follow our detailed guide:

👉 **[Read the Testing Guide](./testing-guide.md)**

---

## ‼️ Important for NGROK

To run the system locally, you need to expose your local servers to the internet using ngrok so Twilio can reach them.

1. Create a tunnel in ngrok for WSS server at port 8080. It will give you a URL.
2. Update the `.env` file with the public URL of the tunnel in the `PUBLIC_WS_URL` section.
3. Create an `ngrok.yml` at the root of the project and add the following content:
   ```yaml
   version: "2"
   authtoken: <YOUR_NGROK_AUTH_TOKEN>
   tunnels:
     nextjs:
       proto: http
       addr: 3002 # for nextjs server (can be port 3000, 3001 as well)
     wsserver:
       proto: http
       addr: 8080 # for wss server
   ```
4. Run the following command to start both tunnels:
   ```bash
   ngrok start --config=ngrok.yml --all
   ```