./Saas/serveflow/frontend/src/app/auth/register/page.tsx:100:9 Parsing ecmascript source code failed 98 | <Link href="/"> 99 | <img src="/logo.svg"

## Error Type

Console Error

## Error Message

A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.

- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.

- Date formatting in a user's locale which doesn't match the server.

- External changing data without sending a snapshot of it along with the HTML.

- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

https://react.dev/link/hydration-mismatch

  ...

    <HotReload globalError={[...]} webSocket={WebSocket} staticIndicatorState={{pathname:null, ...}}>

      <AppDevOverlayErrorBoundary globalError={[...]}>

        <ReplaySsrOnlyErrors>

        <DevRootHTTPAccessFallbackBoundary>

          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>

            <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<NotAllowedRootHTTPFallbackError>} ...>

              <RedirectBoundary>

                <RedirectErrorBoundary router={{...}}>

                  <Head>

                  <__next_root_layout_boundary__>

                    <SegmentViewNode type="layout" pagePath="/Saas/serv...">

                      <SegmentTrieNode>

                      <link>

                      <script>

                      <script>

                      <script>

                      <RootLayout>

                        <html

                          lang="en"

-                         rtrvr-has-react="1"

-                         rtrvr-global-listener-click="1"

-                         rtrvr-global-listener-input="1"

-                         rtrvr-global-listener-change="1"

-                         rtrvr-global-listener-keydown="1"

-                         rtrvr-global-listener-keyup="1"

-                         rtrvr-global-listener-pointerdown="1"

-                         rtrvr-global-listener-pointerup="1"

-                         rtrvr-global-listener-submit="1"

-                         rtrvr-global-listener-focus="1"

-                         rtrvr-global-listener-blur="1"

-                         rtrvr-global-listener-domcontentloaded="1"

-                         rtrvr-global-listener-mouseenter="1"

-                         rtrvr-global-listener-mouseleave="1"

-                         rtrvr-global-listener-mouseover="1"

-                         rtrvr-global-listener-mouseout="1"

-                         rtrvr-global-listener-mousedown="1"

-                         rtrvr-global-listener-mouseup="1"

-                         rtrvr-global-listener-wheel="1"

-                         rtrvr-global-listener-scroll="1"

-                         rtrvr-global-listener-dragstart="1"

-                         rtrvr-global-listener-drop="1"

-                         rtrvr-global-listener-touchstart="1"

-                         rtrvr-global-listener-touchend="1"

-                         rtrvr-global-listener-wallet-standard:app-ready="1"

-                         rtrvr-main-world-ready="1"

-                         rtrvr-global-listener-message="1"

-                         rtrvr-global-listener-resize="1"

-                         rtrvr-global-listener-error="1"

-                         rtrvr-global-listener-unhandledrejection="1"

-                         rtrvr-global-listener-beforeunload="1"

-                         rtrvr-global-listener-test="1"

-                         rtrvr-global-listener-pagehide="1"

-                         rtrvr-global-listener-pageshow="1"

-                         rtrvr-global-listener-selectionchange="1"

-                         rtrvr-global-listener-abort="1"

-                         rtrvr-global-listener-auxclick="1"

-                         rtrvr-global-listener-beforetoggle="1"

-                         rtrvr-global-listener-cancel="1"

-                         rtrvr-global-listener-canplay="1"

-                         rtrvr-global-listener-canplaythrough="1"

-                         rtrvr-global-listener-close="1"

-                         rtrvr-global-listener-contextmenu="1"

-                         rtrvr-global-listener-copy="1"

-                         rtrvr-global-listener-cut="1"

-                         rtrvr-global-listener-drag="1"

-                         rtrvr-global-listener-dragend="1"

-                         rtrvr-global-listener-dragenter="1"

-                         rtrvr-global-listener-dragexit="1"

-                         rtrvr-global-listener-dragleave="1"

-                         rtrvr-global-listener-dragover="1"

-                         rtrvr-global-listener-durationchange="1"

-                         rtrvr-global-listener-emptied="1"

-                         rtrvr-global-listener-encrypted="1"

-                         rtrvr-global-listener-ended="1"

-                         rtrvr-global-listener-gotpointercapture="1"

-                         rtrvr-global-listener-invalid="1"

-                         rtrvr-global-listener-keypress="1"

-                         rtrvr-global-listener-load="1"

-                         rtrvr-global-listener-loadeddata="1"

-                         rtrvr-global-listener-loadedmetadata="1"

-                         rtrvr-global-listener-loadstart="1"

-                         rtrvr-global-listener-lostpointercapture="1"

-                         rtrvr-global-listener-mousemove="1"

-                         rtrvr-global-listener-paste="1"

-                         rtrvr-global-listener-pause="1"

-                         rtrvr-global-listener-play="1"

-                         rtrvr-global-listener-playing="1"

-                         rtrvr-global-listener-pointercancel="1"

-                         rtrvr-global-listener-pointermove="1"

-                         rtrvr-global-listener-pointerout="1"

-                         rtrvr-global-listener-pointerover="1"

-                         rtrvr-global-listener-progress="1"

-                         rtrvr-global-listener-ratechange="1"

-                         rtrvr-global-listener-reset="1"

-                         rtrvr-global-listener-seeked="1"

-                         rtrvr-global-listener-seeking="1"

-                         rtrvr-global-listener-stalled="1"

-                         rtrvr-global-listener-suspend="1"

-                         rtrvr-global-listener-timeupdate="1"

-                         rtrvr-global-listener-touchcancel="1"

-                         rtrvr-global-listener-volumechange="1"

-                         rtrvr-global-listener-toggle="1"

-                         rtrvr-global-listener-touchmove="1"

-                         rtrvr-global-listener-waiting="1"

-                         rtrvr-global-listener-scrollend="1"

-                         rtrvr-global-listener-animationend="1"

-                         rtrvr-global-listener-animationiteration="1"

-                         rtrvr-global-listener-animationstart="1"

-                         rtrvr-global-listener-dblclick="1"

-                         rtrvr-global-listener-focusin="1"

-                         rtrvr-global-listener-focusout="1"

-                         rtrvr-global-listener-transitionrun="1"

-                         rtrvr-global-listener-transitionstart="1"

-                         rtrvr-global-listener-transitioncancel="1"

-                         rtrvr-global-listener-transitionend="1"

-                         rtrvr-global-listener-compositionend="1"

-                         rtrvr-global-listener-textinput="1"

-                         rtrvr-global-listener-compositionstart="1"

-                         rtrvr-global-listener-compositionupdate="1"

-                         rtrvr-listeners="mouseover:delegated;mouseenter:delegated;mouseout:delegated"

-                         rtrvr-role="other"

                        >

                          <head>

                          <body

                            className="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__var..."

-                           rtrvr-listeners="mouseover:delegated;mouseenter:delegated;mouseout:delegated"

-                           rtrvr-role="other"

                          >

                            ...

                              <SegmentViewNode type="page" pagePath="/Saas/serv...">

                                <SegmentTrieNode>

                                <LandingPage>

                                  <div

                                    className={"min-h-screen w-full bg-[#F8F9FA] dark:bg-[#0A2540] text-[#0A2540] dar..."}

-                                   rtrvr-listeners="mouseover:delegated;mouseenter:delegated;mouseout:delegated"

-                                   rtrvr-role="other"

                                  >

                                    <header className="sticky top...">

                                      <LinkComponent>

                                        <LinkComponent href="/" className="flex items...">

                                          <a

                                            className="flex items-center gap-3"

                                            ref={function}

                                            onClick={function onClick}

                                            onMouseEnter={function onMouseEnter}

                                            onTouchStart={function onTouchStart}

                                            href="/"

-                                           rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                           rtrvr-role="link"

                                          >

                                      <div className="flex gap-2">

                                        <LinkComponent>

                                          <LinkComponent href="/auth/login" className="flex curso...">

                                            <a

                                              className="flex cursor-pointer items-center justify-center rounded-full ..."

                                              ref={function}

                                              onClick={function onClick}

                                              onMouseEnter={function onMouseEnter}

                                              onTouchStart={function onTouchStart}

                                              href="/auth/login"

-                                             rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                             rtrvr-role="link"

                                            >

+                                             Log In

                                        <LinkComponent>

                                          <LinkComponent href="/auth/regi..." className="flex curso...">

                                            <a

                                              className="flex cursor-pointer items-center justify-center rounded-full ..."

                                              ref={function}

                                              onClick={function onClick}

                                              onMouseEnter={function onMouseEnter}

                                              onTouchStart={function onTouchStart}

                                              href="/auth/register"

-                                             rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                             rtrvr-role="link"

                                            >

+                                             Sign Up

                                    <main

-                                     rtrvr-listeners="mouseover:delegated;mouseenter:delegated;mouseout:delegated"

-                                     rtrvr-role="other"

                                    >

                                      <section

                                        className="px-4 py-16 sm:py-24"

-                                       rtrvr-listeners="mouseover:delegated;mouseenter:delegated;mouseout:delegated"

-                                       rtrvr-role="other"

                                      >

                                        <div

                                          className="flex min-h-[400px] flex-col gap-6 items-center justify-center tex..."

-                                         rtrvr-listeners="mouseover:delegated;mouseenter:delegated"

-                                         rtrvr-role="other"

                                        >

                                          <div>

                                          <LinkComponent>

                                            <LinkComponent href="/auth/regi..." className="flex w-ful...">

                                              <a

                                                className="flex w-full max-w-xs cursor-pointer items-center justify-ce..."

                                                ref={function}

                                                onClick={function onClick}

                                                onMouseEnter={function onMouseEnter}

                                                onTouchStart={function onTouchStart}

                                                href="/auth/register"

-                                               rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                               rtrvr-role="link"

                                              >

+                                               Get Started for Free

                                      <section>

                                      <section>

                                      <section>

                                      <section>

                                      <section className="px-4 py-16...">

                                        <div className="flex flex-...">

                                          <div>

                                          <LinkComponent>

                                            <LinkComponent href="/auth/regi..." className="flex w-ful...">

                                              <a

                                                className="flex w-full max-w-xs cursor-pointer items-center justify-ce..."

                                                ref={function}

                                                onClick={function onClick}

                                                onMouseEnter={function onMouseEnter}

                                                onTouchStart={function onTouchStart}

                                                href="/auth/register"

-                                               rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                               rtrvr-role="link"

                                              >

+                                               Sign Up Now

                                    <footer className="p-8 bg-whi...">

                                      <div className="flex flex-...">

                                        <div>

                                        <div className="flex gap-6...">

                                          <a

                                            className="text-[#6C757D] dark:text-[#adb5bd] hover:text-[#4A90E2]"

                                            href="#"

-                                           rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                           rtrvr-role="link"

                                          >

+                                           Privacy Policy

                                          <a

                                            className="text-[#6C757D] dark:text-[#adb5bd] hover:text-[#4A90E2]"

                                            href="#"

-                                           rtrvr-listeners="dragstart:other;dragend:other;click:delegated"

-                                           rtrvr-role="link"

                                          >

+                                           Terms of Service

                                        ...

                              ...

                  ...

    at a (<anonymous>:null:null)

    at LandingPage (src\app\page.tsx:8:9)

## Code Frame

   6 |       {/* Header */}

   7 |       <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#F8F9FA]/80 dark:bg-[#0A2540]/80 backdrop-blur-sm border-b border-[#dee2e6] dark:border-[#1d4879]">

>  8 |         <Link href="/" className="flex items-center gap-3">

     |         ^

   9 |           <img src="/logo.svg" alt="FlowServe AI" className="w-10 h-10" />

  10 |           <h2 className="text-xl font-bold">FlowServe AI</h2>

  11 |         </Link>

Next.js version: 16.0.4 (Turbopack)

