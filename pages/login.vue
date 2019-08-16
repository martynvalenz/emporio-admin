<template>
    <div style="height: 100vh">
        <Login></Login>
    </div>
</template>

<script>
import Login from '@/components/Login'
export default {
    head:{
        title: 'Login'
    },
    components:{Login},
    middleware: ['guest'],
    layout: 'auth'
}
</script>

<style>

</style>
