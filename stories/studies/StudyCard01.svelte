<script>
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  import StudySet from "./StudySet.svelte";
</script>

<style>
  .container {
    min-height: 100vh;
    padding: 1rem;
  }
  .study-card-set {
    width: 660px;
    display: grid;
    margin: auto;
    grid-auto-flow: row;
    align-items: start;
    grid-gap: 2rem;
  }
</style>

<div class="container noise-background">
  <div class="study-card-set">
    <StudySet />
  </div>
</div>
