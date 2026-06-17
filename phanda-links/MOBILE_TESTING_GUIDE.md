# Mobile Testing Guide for Phanda Links

## Quick Mobile Test Checklist

### Using Chrome DevTools Mobile Emulation (Recommended First Step)

1. **Open the App**
   - Start your dev server: `npm run dev`
   - Open http://localhost:3000 in Chrome

2. **Activate Mobile View**
   - Press `F12` to open DevTools
   - Press `Ctrl+Shift+M` (or click the device toggle icon)
   - Select different device profiles: iPhone 14, iPhone SE, Pixel 5, iPad, etc.

3. **Test Each Breakpoint**

#### Mobile (320px - 639px)
- [ ] Homepage loads without horizontal scroll
- [ ] Navigation menu hamburger icon visible
- [ ] All text readable without zooming
- [ ] Buttons are touch-friendly (min 44x44 px)
- [ ] Forms are easy to use on small screen
- [ ] Images scale appropriately

#### Tablet (768px - 1023px) 
- [ ] Layout adapts properly
- [ ] Grid layouts still organized
- [ ] Touch targets still adequate
- [ ] No wasted space on sides

#### Desktop (1024px+)
- [ ] Full layout displays correctly
- [ ] Navigation menu shows horizontally
- [ ] Images display at full size
- [ ] Grid layouts maximize space

### Critical Pages to Test

#### Authentication Pages (No Login Required)
1. **Homepage** (`/`)
   - Test on all breakpoints
   - Verify hero image responsive
   - Check CTA buttons are clickable on mobile

2. **Login Page** (`/login`)
   - Password visibility toggle works on mobile
   - Form is vertical on mobile
   - Eye icon is clickable
   - "Forgot password" link visible

3. **Signup Page** (`/signup`)
   - Password field visible with toggle
   - Role selection (Worker/Client) visible and usable
   - Form validation errors display clearly
   - Submit button is large enough

#### Dashboard Pages (Requires Login)
Create test accounts:
- **Worker Account**: Use role "worker"
- **Client Account**: Use role "client"

4. **Worker Dashboard** (`/dashboard/worker`)
   - Hamburger menu works on mobile
   - Stats cards stack vertically on mobile
   - Recent jobs list is readable
   - Navigation links work

5. **Client Dashboard** (`/dashboard/client`)
   - Posted jobs list displays correctly
   - Job cards are readable on mobile
   - Quick action buttons are clickable
   - Links to post-job and bookings work

6. **Worker Directory** (`/workers`)
   - Worker cards stack properly on mobile
   - Avatar images load
   - Worker info is readable
   - Search/filter works on mobile
   - Clicking worker card navigates correctly

7. **Messages** (`/dashboard/messages`)
   - Message list displays clearly
   - Message bubbles are readable
   - Input field is usable on mobile
   - Scrolling works smoothly

8. **Worker Profile** (`/dashboard/worker/profile`)
   - Avatar displays and is clickable
   - Profile form is usable on mobile
   - Upload button is accessible
   - Save button works

9. **Client Profile** (`/dashboard/client/profile`)
   - Similar checks as worker profile
   - All form fields accessible

### Common Mobile Issues to Watch For

- [ ] Horizontal scrolling (shouldn't happen)
- [ ] Text too small to read (min 16px on mobile)
- [ ] Buttons too small to tap (min 44x44 px)
- [ ] Images not loading
- [ ] Forms with horizontal overflow
- [ ] Navigation menu not closing after click
- [ ] Touchscreen keyboard covering input fields
- [ ] Fixed position elements blocking content
- [ ] Long URLs or numbers breaking layout
- [ ] Dropdown menus not closing properly

### Network Testing

Test on slow connections to simulate real mobile conditions:

1. Open Chrome DevTools
2. Go to Network tab
3. Change "Throttling" from "No throttling" to "3G Slow" or "4G"
4. Reload the page
5. Verify:
   - [ ] Page still loads and is usable
   - [ ] Images eventually load
   - [ ] Forms are responsive
   - [ ] Loading states work properly

### Real Device Testing

Once mobile emulation testing passes, test on actual devices:

**iOS Testing**
- Safari on iPhone 12/13/14/15
- Check: touch interactions, font sizes, keyboard behavior
- Test on WiFi and cellular data

**Android Testing**  
- Chrome on various Android devices
- Check: touch interactions, responsive behavior
- Test on different screen sizes (small, large, foldable)

### Test Account Credentials

Use these for testing:
```
Worker Account:
Email: worker@test.com
Password: [your test password]
Role: Worker

Client Account:
Email: client@test.com
Password: [your test password]
Role: Client
```

### Performance on Mobile

Test using Lighthouse (Chrome DevTools):
1. Open DevTools
2. Go to Lighthouse tab
3. Select "Mobile" option
4. Click "Analyze page load"
5. Target scores:
   - Performance: 80+
   - Accessibility: 90+
   - Best Practices: 90+
   - SEO: 90+

If scores are lower, check:
- Large unoptimized images
- Render-blocking JavaScript
- Cumulative Layout Shift (CLS)
- Largest Contentful Paint (LCP)

### Issues to Report

If you find issues, check:
1. Is it a Tailwind responsive class issue? (missing sm:, md:, lg:)
2. Is it a component size issue? (button, text, image)
3. Is it a layout issue? (grid, flexbox not responsive)
4. Is it a z-index issue? (dropdown, modal behind content)
5. Is it a touch/interaction issue? (button not clickable, scroll issues)

Document:
- Device type and screen size
- Browser and version
- Exact steps to reproduce
- Screenshot if possible
- Expected behavior vs actual behavior

### Related Files for Reference

**Responsive Tailwind Classes Used:**
- `sm:` (640px and up)
- `md:` (768px and up)  
- `lg:` (1024px and up)
- `xl:` (1280px and up)

**Key Components to Test:**
- `src/components/layout/Navbar.tsx` - Navigation with mobile menu
- `src/app/dashboard/layout.tsx` - Dashboard layout with sidebar
- `src/components/dashboard/` - Dashboard components
- `src/components/ui/` - UI components

