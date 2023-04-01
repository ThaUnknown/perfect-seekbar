<script context='module'>
  // percentage clamp
  function clamp (value) {
    return Math.min(Math.max(value, 0), 100)
  }

  function toTS (sec) {
    const hours = Math.floor(sec / 3600)
    let minutes = Math.floor(sec / 60) - hours * 60
    let seconds = Math.floor(sec % 60)
    if (minutes < 10 && hours > 0) minutes = '0' + minutes
    if (seconds < 10) seconds = '0' + seconds
    return hours > 0 ? hours + ':' + minutes + ':' + seconds : minutes + ':' + seconds
  }
</script>

<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  let seekbar = null

  let seeking = false

  function calculatePositionProgress ({ pageX, currentTarget }) {
    const percent = clamp((pageX - currentTarget.offsetLeft) / currentTarget.clientWidth * 100)
    if (seeking) {
      dispatch('seeking', percent)
      progress = percent
    }
    seek = percent
  }

  function endHover () {
    seek = 0
  }

  function startSeeking (e) {
    seeking = true
    calculatePositionProgress(e)

    if (e.pointerId) seekbar.setPointerCapture(e.pointerId)
  }
  function endSeeking ({ pointerId }) {
    seeking = false
    if (pointerId) seekbar.releasePointerCapture(pointerId)
    dispatch('seeked')
  }

  export let chapters = []

  $: sum = chapters && 0
  $: processedChapters = chapters
    .map(({ size, title }) => {
      const cloned = { // don't mutate the original chapters, bad idea if it's references to binary stuff like EBML
        size,
        title,
        offset: sum,
        scale: (100 / size)
      }
      sum += size
      return cloned
    })

  export let progress = 0 // current position or current seeking position
  export let buffer = 0
  export let seek = 0 // seek target

  // length in seconds
  export let length = 0

  function checkThumbActive (progress, seek) {
    for (const { offset, size } of processedChapters) {
      if (offset + size > progress) return offset + size > seek && offset < seek
    }
  }
  function getCurrentChapterTitle (seek) {
    for (const { offset, size, title } of processedChapters) {
      if (offset + size > seek) return offset + size > seek && offset <= seek && (title || '')
    }
  }
  let thumbnail = ''
  export let getThumbnail = null

  async function updateThumbnail () {
    const initialTime = seek
    thumbnail = ''
    const newThumbnail = await getThumbnail(seek)
    if (initialTime === seek) thumbnail = newThumbnail || ''
  }
  $: getThumbnail && updateThumbnail(seek)

  export let accentColor = '#f00'
</script>

<!-- eslint-disable-next-line svelte/valid-compile -->
<svelte:options tag='perfect-seekbar' />

<div class='seekbar'
  bind:this={seekbar}
  on:pointerdown={startSeeking}
  on:pointerup={endSeeking}
  on:pointermove={calculatePositionProgress}
  on:pointerleave={endHover}
  style:--accent={accentColor}>
  {#each processedChapters as { size, offset, scale }}
    {@const seekPercent = clamp((seek - offset) * scale)}
    <div style:width={size + '%'} class='chapter-wrapper'>
      <!-- need to manually handle hovering as hovering while holding down pointer doesn't work across multiple elements -->
      <div class='chapter w-full' class:active={seekPercent > 0 && seekPercent < 100}>
        <div class='base-bar w-full' />
        <div class='base-bar' style:width={clamp((buffer - offset) * scale) + '%'} />
        <div class='base-bar' style:width={seekPercent + '%'} />
        <div class='ps-progress-bar' style:width={clamp((progress - offset) * scale) + '%'} />
      </div>
    </div>
  {:else}
    <div class='chapter-wrapper w-full'>
      <div class='chapter w-full'>
        <div class='base-bar w-full' />
        <div class='base-bar' style:width={clamp(buffer) + '%'} />
        <div class='base-bar' style:width={clamp(seek) + '%'} />
        <div class='ps-progress-bar' style:width={clamp(progress) + '%'} />
      </div>
    </div>
  {/each}
  <div class='thumb-container center' style:left={progress + '%'}>
    <div class='thumb' class:active={checkThumbActive(progress, seek)} />
  </div>
  <div class='center hover-container' style:--progress={seek + '%'} style:--padding={getThumbnail ? '75px' : '15px'}>
    <div class='center'>
      <img alt='thumbnail' class='thumbnail' src={thumbnail} />
      <div>{getCurrentChapterTitle(seek) || ''}</div>
      {#if length}
        <div>{toTS(length * (seek / 100))}</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .w-full {
    width: 100%;
  }
  .center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .seekbar {
    height: 25px;
    display: flex;
    flex-direction: row;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    position: relative;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: #0000;
  }

  @media(pointer: fine) {
    .seekbar:hover .hover-container {
      display: flex
    }
  }
  .hover-container {
    position: absolute;
    left: clamp(var(--padding), var(--progress), 100% - var(--padding)) !important;
    display: none;
    pointer-events: none;
    font-family: Roboto,Bahnschrift,Arial,Helvetica,sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: #eee;
    white-space: nowrap;
    text-shadow: 0 0 4px rgba(0,0,0,.75);
  }
  .hover-container > div {
    flex-direction: column;
    gap: 3px;
    position: absolute;
    bottom: -10px
  }
  .thumbnail {
    width: 150px;
    bottom: 13px;
    border: #eee 2px solid;
    border-radius: 2px;
    margin-bottom: 5px;
  }
  .thumbnail[src='']{
    display: none;
  }
  .seekbar:hover .thumb, .seekbar:active .thumb {
    width: 13px;
    height: 13px;
  }
  .seekbar:hover .thumb.active, .seekbar:active .thumb.active {
    width: 19px;
    height: 19px;
  }
  .thumb-container {
    position: absolute;
    bottom: 5px;
  }
  .thumb {
    width: 0;
    height: 0;
    background: var(--accent);
    position: absolute;
    border-radius: 50%;
    transition: width .1s cubic-bezier(.4,0,1,1), height .1s cubic-bezier(.4,0,1,1);
  }
  .chapter-wrapper {
    display: flex;
    align-items: end;
    position: relative;
    overflow: hidden;
  }
  .chapter-wrapper + .chapter-wrapper .chapter {
    left: 2px;
  }
  .chapter-wrapper + .chapter-wrapper .chapter div {
    left: -2px;
  }
  .chapter {
    height: 9px;
    display: flex;
    align-items: center;
    position: absolute;
    overflow: hidden;
    left: 0
  }
  .chapter div {
    height: 3px;
    transition: height .1s cubic-bezier(.4,0,1,1);
    position: absolute;
  }
  .base-bar {
    background: rgba(255,255,255,.2);
  }
  .ps-progress-bar {
    background-color: var(--accent);
  }
  .chapter.active div {
    height: 9px !important;
  }
  .seekbar:hover .chapter div {
    height: 5px;
  }
</style>
