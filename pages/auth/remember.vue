<template>
	<v-parallax
        style="height: 100%; background-size: cover; width: auto"
        height="100%"
        :src="slider"
        >
        <v-container fluid fill-height>
            <v-layout align-center justify-center>
                <v-flex xs12 sm8 md6 lg4 xl4>
                    <v-form @submit.prevent="Remember">
                        <v-card dark style="background-color: rgba(50, 50, 50, 0.8)">
                            <v-toolbar color="light-blue darken-4">
                                <v-toolbar-title>Anotar correo para recuperar contraseña</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <span class="red--text" v-if="errors.email">{{ errors.email[0] }}</span>
                                <span class="red--text" v-if="snackText">{{ snackText }}</span>
                                <v-text-field v-model="form.email" outlined color="light-blue darken-2" append-icon="mail" name="login" label="Cuenta de correo" type="text"  ></v-text-field>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn type="submit" block dark color="light-blue darken-4" :loading="loading">Recuperar contraseña <i style="padding-left: 0.5em" class="fas fa-paper-plane"></i></v-btn>
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
export default {
	head:{
        title: 'Recuperar contraseña'
    },
    middleware: ['guest'],
	layout: 'auth',
	
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
				email: ''
				
            }
		}
	},

	created(){
        this.changeSlider();
    },

	methods: {

		async Remember()
		{

		},

        async changeSlider()
        {
            await this.$axios.get('/api/images/slider')
            .then(res => {
                // console.log(res.data.image)
                this.slider = `${this.$axios.defaults.baseURL}/images/background/${res.data.imagen}`;
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