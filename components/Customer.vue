<template>
    <div>
        <v-dialog v-model="customer_dialog" max-width="750" height="auto" style="overflow: auto;">
			<v-form @submit.prevent="Save">
				<v-card>
					<v-card-title class="primary white--text">
						Agregar cliente
						<v-spacer></v-spacer>
						<v-btn icon @click="customer_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-container>
							<v-row>
								<v-col cols="12" sm="12" md="12">
									<v-text-field label="Nombre comercial *" outlined v-model="customer" append-icon="person_add" autofocus :error-messages="errors.customer"></v-text-field>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12" sm="12" md="5">
									<v-select v-model="strategy_id" @change="changeStrategy" outlined item-value="id" item-text="strategy" :items="strategies" label="Seleccionar estrategia" :error-messages="errors.strategy_id"></v-select>
								</v-col>
								<v-col cols="12" sm="12" md="7" v-if="strategy_id == 1">
									<v-autocomplete v-model="referred" :items="referrals" outlined :loading="referralLoading" :search-input.sync="search" hide-no-data hide-selected item-text="customer" item-value="id" placeholder="Referido por..." prepend-icon="person" return-object clearable label="Seleccionar cliente..." :error-messages="errors.referred_by"></v-autocomplete>
								</v-col>
							</v-row>
						</v-container>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="customer_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" type="submit" :loading="loading">Guardar <v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
        <v-snackbar
            v-model="snackbar"
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
    </div>
</template>

<script>
export default {
    data(){
        return{
            customer_dialog:false,
            errors:{},
            //Referrals
			referrals:[],
            referred: null,
            referred_by:'',
			search: null,
			referralLoading: false,
            descriptionLimit: 60,
            //Customer
            customer:'',
            strategies:[],
            strategy_id:'',
			loading: false,
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
			timeout: 6000,
        }
    },

    watch: {
		search(val){
			if(val){
				val && val !== this.referred && this.customerSelect(val)
			}
			else{
				this.referred_by = '';
				this.referrals = '';
				this.referred = null;
			}
		}
	},

    methods:{
        addCustomer()
        {
            this.customer_dialog = true;
            this.getStrategies();
            this.clearForm();
        },

        changeStrategy(){
			if(this.strategy_id !== 1){
				this.referred_by = '';
				this.referrals = '';
				this.referred = null;
			}
        },
        
        async getStrategies(){
			await this.$axios.get('/api/getStrategies')
			.then(res => {
				this.strategies = res.data;
			})
			.catch(error =>{
				console.log(error);
			});
        },
        
        customerSelect(val){
			this.referralLoading = true;
			this.$axios.get(`/api/customers/list/${val}`)
			.then(res => {
				this.referrals = res.data;
				this.referred_by = this.referred.id;
				this.referralLoading = false;
			})
			.catch(error => {
				console.log(error);
				this.referralLoading = false;
			})
        },
        
        clearForm(){
            this.customer = '';
            this.strategy_id = '';
            this.strategies = [];
            this.errors = {};
        },

        async Save(){
            await this.$axios.post('/api/customer', {customer:this.customer, strategy_id:this.strategy_id, referred_by:this.referred_by})
            .then(res => {
                this.loading = false;
                this.clearForm();
                this.customer_dialog = false;
                this.snackColor = 'success';
                this.snackbar = true;
                this.snackText = 'Se agregó el cliente '+res.data.customer;
            })
            .catch(error => {
                this.loading = false;
                this.errors = error.response.data.errors;
                this.error_alert = true;
                this.snackColor = 'error';
                this.snackbar = true;
                this.snackText = 'No se pudo agregar el cliente, revise los errores en el formulario.';
            })
        }
    }
}
</script>