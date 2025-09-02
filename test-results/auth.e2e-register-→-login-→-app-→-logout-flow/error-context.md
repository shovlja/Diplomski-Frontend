# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - img "Welcome" [ref=e4]
    - generic [ref=e6]:
      - heading "Organize Work. Ship Faster." [level=1] [ref=e8]:
        - generic [ref=e9]: Organize
        - text: Work. Ship
        - generic [ref=e10]: Faster.
      - paragraph [ref=e11]: Plan boards, track tasks, and move as one team — clean, fast, and beautifully simple.
    - generic [ref=e15]:
      - heading "Sign in" [level=2] [ref=e16]
      - paragraph [ref=e17]: Access your PMHub workspace
      - generic [ref=e18]:
        - generic [ref=e19]:
          - generic [ref=e20]: Email
          - textbox "Email" [ref=e21]: e2e_1756811900815@example.com
        - generic [ref=e22]:
          - generic [ref=e23]: Password
          - generic [ref=e24]:
            - textbox "Password" [ref=e25]: Test12345!
            - button "Show password" [ref=e26]: Show
        - button "Sign in" [active] [ref=e27]
        - generic [ref=e28]:
          - text: New here?
          - link "Create account" [ref=e29] [cursor=pointer]:
            - /url: /register
  - region "Notifications alt+T"
```