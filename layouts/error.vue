<template>
	<v-app dark>
		<v-row  v-if="authenticated && error.statusCode != 404">
			<v-col cols="12" sm="12" md="12" lg="12">
				<v-card>
					<v-card-text style="text-align:center" class="pa-4">
						<h1 style="color: red;">Ocurrió un error</h1>
						<br>
						<p>Generar un nuevo ticket a soporte o <a @click="Reload">Recargar página <v-icon right>sync</v-icon></a></p>
						<v-card-text>
							<v-row justify="center">
								<v-col cols="12" sm="10" md="7" lg="5">
									<Support :error="0"></Support>
								</v-col>
							</v-row>
						</v-card-text>
						<v-btn class="primary" dark @click="Reload()">Recargar página <v-icon right>sync</v-icon></v-btn>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<v-parallax v-if="authenticated && error.statusCode === 404"
			style="height: 100%; background-size: cover; width: auto"
			height="100%"
			:src="slider"
			>
			<v-container>
				<v-row justify="center">
					<v-col cols="12" sm="10" md="8" lg="6">
						<v-card dark style="background-color: rgba(50, 50, 50, 0.8)">
							<v-card-text style="text-align:center" class="pa-4">
								<h1>Página no encontrada</h1>
								<br>
								<v-btn class="primary" dark router exact to="/admin">Regresar al Inicio</v-btn>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-container>
		</v-parallax>
		<v-parallax v-if="!authenticated && error.statusCode != 404"
			style="height: 100%; background-size: cover; width: auto"
			height="100%"
			src="/images/page/error_404.jpg"
			>
			<v-container>
				<v-row justify="center">
					<v-col cols="12" sm="10" md="8" lg="6">
						<v-card dark style="background-color: rgba(50, 50, 50, 0.8)">
							<v-card-text style="text-align:center" class="pa-4">
								<h1>Página no encontrada</h1>
								<br>
								<v-btn class="primary" dark router exact to="/">Regresar al Login</v-btn>
							</v-card-text>
						</v-card>
					</v-col>
				</v-row>
			</v-container>
		</v-parallax>
	</v-app>
</template>

<script>
import Support from '@/components/Support'
export default {
	layout: 'empty',
	components:{Support},
	props: {
		error: {
			type: Object,
			default: null
		}
	},
	head () {
		const title =
				this.error.statusCode === 404 ? this.pageNotFound : this.otherError
			return {
				title
		}
	},
	data () {
		return {
			pageNotFound: '404 Página no encontrada',
			otherError: 'Ocurrió un error',
			slider: '',
		}
	},

	created(){
        this.changeSlider();
    },

	methods:{
		async changeSlider()
        {
            await this.$axios.get('/api/images/slider')
            .then(res => {
                // console.log(res.data.image)
                this.slider = `${this.$axios.defaults.baseURL}/images/background/${res.data.image}`;
            })
		},
		
		Reload(){
			location.reload();
		}
	}
}
</script>

<style scoped>


</style>
