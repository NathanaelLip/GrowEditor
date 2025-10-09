<template>
  <!-- This is the main container for the entire application -->
  <div>
    <!-- <header>
      <nav style="display: flex; gap: 1rem; justify-content: center; font-size: 1.2rem;">
        <router-link to="/">Editor</router-link>
      </nav>
    </header> -->
    <main class="main">
      <!-- This is where the content of the current route will be displayed -->
      <router-view />
    </main>
  </div>
</template>

<style>
:root {
  --primary: #22a173;
  --primary-hover: #1c805c;
  --secondary: #db1d95;
  --secondary-hover: #bd1780;
  --activity: #4fc0a2;
  --activity-hover: #41a389;
  --scripture: #c52026;
  --scripture-hover: #9e1c21;
  --object: #52b849;
  --object-hover: #42993a;
  --video: #e2de1b;
  --video-hover: #c2bf19;
  --bigidea: #4643ba;
  --bigidea-hover: #33308a;
  --reflection: #b764a9;
  --reflection-hover: #874c7d;
  --response: #5c479c;
  --response-hover: #443573;
  --memory: #c52026;
  --memory-hover: #8f1519;
  --prayer: #ec497f;
  --prayer-hover: #b33660;
  --discussion: #a2dae1;
  --discussion-hover: #769ca1;
  --poll: #d84826;
  --poll-hover: #a8381f;
  --question: #3290ce;
  --question-hover: #297bb2;
  --black: #292929;
  --white: #f3f3f3;
  --light-gray: #eaeaea;
}

.main {
  padding: 2rem;
}

@media print {
  .main {
    padding: 0.5rem;
  }
}
</style>