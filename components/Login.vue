<template>
    <v-parallax
        style="height: 100%; background-size: cover; width: auto"
        height="100%"
        :src="slider"
        >
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md6 lg4 xl4>
                    <v-form @submit.prevent="Login">
                        <v-card dark style="background-color: rgba(50, 50, 50, 0.8)">
                            <v-toolbar color="light-blue darken-4">
                                <v-toolbar-title>Iniciar sesión</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <span class="red--text" v-if="errors.username">{{ errors.username[0] }}</span>
                                <span class="red--text" v-if="snackText">{{ snackText }}</span>
                                <v-text-field v-model="form.username" outlined color="light-blue darken-2" append-icon="person" name="login" label="Nombre de Usuario" type="text"  ></v-text-field>
                                
                                <span class="red--text" v-if="errors.password">{{ errors.password[0] }}</span>
                                <v-text-field v-model="form.password" outlined color="light-blue darken-2" :append-icon="showPassword ? 'visibility' : 'visibility_off'"
                                
                                    :type="showPassword ? 'text' : 'password'"
                                    counter
                                    @click:append="showPassword = !showPassword" name="password" label="Password" id="password"></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn to="/auth/remember" text color="light-blue" class="router-linker">¿Olvidaste tu contraseña?</v-btn>
                                <v-spacer></v-spacer>
                                <v-btn type="submit" dark color="light-blue darken-4" :loading="loading">Login <i style="padding-left: 0.5em" class="fas fa-lock-open"></i></v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-form>
                </v-flex>
            </v-layout>
            
        </v-container>
        <v-snackbar
            v-model="snackbar"
            absolute
            :timeout="timeout"
            top
            right
            
            :color="snackColor"
            >
            {{ snackText }}
            <v-btn
                color="white"
                text
                @click="snackbar = false"
                >
                Cerrar
            </v-btn>
        </v-snackbar>
    </v-parallax>
</template>

<script>
import axios from 'axios'
export default {
    data(){
        return{
            //snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
            timeout: 6000,


            loading: false,
            slider: '',
            showPassword: false,
            errors:{},
            // usuario: '',
            // password: ''
            form:{
                username: '',
                password: ''
            }
        }
    },

    created(){
        this.changeSlider();
    },

    methods: {
        async Login(){
            this.loading = true
            await this.$auth.login({data: this.form})
            .then(res => {
                this.$router.push('/admin');
                this.loading = false;
                
            })
            .catch(error => {
                this.errors = error.response.data.errors;
                this.snackColor = 'error';
                this.snackbar = true;
                this.snackText = 'El usuario o contraseña no coinciden con nuestros registros, o la cuenta está inactiva.';
                this.loading = false;

            });
        },

        async changeSlider()
        {
            await this.$axios.get('/api/images/slider')
            .then(res => {
                // console.log(res.data.image)
                this.slider = `${this.$axios.defaults.baseURL}/images/background/${res.data.image}`;
            })
        }
    },

    props:
    {
        source: String
    }
}
</script>

<style>

</style>
