<template>
	<div>
		<h2>Estrategias de Captación</h2>
		<v-layout class="pt-4">
			<v-flex xs12>
				<v-card :loading="loading_table">
					<v-card-title>
						<v-btn class="primary" @click="create">Agregar Estrategia <v-icon>add</v-icon></v-btn>
						<v-spacer></v-spacer>
						<v-btn icon @click="Load"><v-icon>sync</v-icon></v-btn>
					</v-card-title>
					<v-divider></v-divider>
					<v-card-text>
						<v-simple-table fixed-header>
							<thead>
								<tr>
									<th class="text-left">Estrategia</th>
									<th class="text-left">Clientes</th>
									<th class="text-left">Creada</th>
									<th class="text-left">Estatus</th>
									<th class="text-right"></th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="strategy in strategies" :key="strategy.id">
									<td>{{ strategy.strategy }}</td>
									<td>{{ strategy.customers }}</td>
									<td>{{ strategy.created_at }}</td>
									<td>
										<v-chip v-if="strategy.status" color="green" dark>Activo</v-chip>
										<v-chip v-else dark color="red">Inactivo</v-chip>
									</td>
									<td class="text-right">
										<v-btn icon @click="edit(strategy.id, strategy.strategy)"><v-icon color="warning">edit</v-icon></v-btn>
										<v-btn icon @click="statusModal(strategy.id, strategy.status)" v-if="strategy.status"><v-icon color="error">block</v-icon></v-btn>
										<v-btn icon @click="statusModal(strategy.id, strategy.status)" v-else><v-icon color="success">check</v-icon></v-btn>
									</td>
								</tr>
							</tbody>
						</v-simple-table>
					</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
		<v-dialog v-model="strategy_dialog" width="400">
			<v-form @submit.prevent="Save">
				<v-card>
					<v-alert v-model="error_alert" border="left" close-text="Close Alert" color="red" dark dismissible>
						<span class="white--text" v-if="errors.strategy">{{ errors.strategy[0] }}</span>
						<span class="white--text" v-if="errors.id">{{ errors.id[0] }}</span>
					</v-alert>
					<v-card-title>
						Agregar Estrategia
						<v-spacer></v-spacer>
						<v-btn icon @click="strategy_dialog = false"><v-icon>close</v-icon></v-btn>
					</v-card-title>
					<v-card-text>
						<v-layout>
							<v-flex xs12>
								<v-text-field outlined v-model="strategy" label="Estrategia" append-icon="thumb_up"></v-text-field>
							</v-flex>
						</v-layout>
					</v-card-text>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="strategy_dialog = false">Cerrar</v-btn>
						<v-btn class="primary" type="submit" :loading="loading">Guardar<v-icon right>save</v-icon></v-btn>
					</v-card-actions>
				</v-card>
			</v-form>
		</v-dialog>
		<v-dialog v-model="status_dialog" width="400">
			<v-form @submit.prevent="changeStatus">
				<v-card>
					<v-card-title>
						<div v-if="strategy_status">¿Quieres inactivar la estrategia?</div>
						<div v-else>¿Quieres activar la estrategia?</div>
					</v-card-title>
					<br>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn text @click="status_dialog = false">Cerrar</v-btn>
						<v-btn v-if="strategy_status" class="error" type="submit" :loading="loading">Desactivar <v-icon right>block</v-icon></v-btn>
						<v-btn v-else class="success" type="submit" :loading="loading">Activar<v-icon right>check</v-icon></v-btn>
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
import axios from 'axios'
import Vue from 'vue'
export default {
	layout: 'admin',
	middleware: 'auth',
	head:{
        title: 'Estrategias de Captación'
	},
	data(){
		return{
			strategies:{},
			strategy_dialog: false,
			status_dialog: false,
			strategy_id: '',
			strategy_splice: '',
			strategy: '',
			strategy_status: '',
			loading: false,
			errors: {},
			error_alert: false,
			loading_table:false,
			//snackbar
            snackbar: false,
            snackColor: '',
            snackText: '',
            timeout: 6000,

		}
	},

	created(){
		this.Load();
	},

	methods:{
		async Load(){
			this.loading_table = true;
			await this.$axios.get('/api/strategies')
			.then(res => {
				this.strategies = res.data
				this.loading_table = false;
			})
			.catch(error =>{
				console.log(error);
				this.loading_table = false;
			});
		},

		create(){
			this.strategy_dialog = true;
			this.strategy_id = '';
			this.strategy = '';
			this.errors = {};
			this.error_alert = false;
		},

		edit(id, strategy){
			this.strategy_dialog = true;
			this.strategy_id = id;
			this.strategy = strategy;
			this.errors = {};
			this.error_alert = false;
		},

		async Save(){
			this.loading = true;
			//Update
			if(this.strategy_id){
				await this.$axios.put(`/api/strategy/${this.strategy_id}`, {strategy:this.strategy})
				.then(res => {
					this.loading = false;
					this.strategy_id = '';
					this.strategy = '';
					this.strategy_dialog = false;
					this.Load();
					this.snackColor = 'success';
					this.snackbar = true;
					this.snackText = 'Se actualizó el registro.';
					
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
					this.error_alert = true;
				})
			}
			//Store
			else{
				await this.$axios.post(`/api/strategy`, {strategy:this.strategy})
				.then(res => {
					this.strategies.unshift(res.data);
					this.loading = false;
					this.strategy_id = '';
					this.strategy = '';
					this.strategy_dialog = false;
					this.snackColor = 'success';
					this.snackbar = true;
					this.snackText = 'Se agregó el registro "' + res.data.strategy + '"';
				})
				.catch(error => {
					this.loading = false;
					this.errors = error.response.data.errors;
					this.error_alert = true;
				})
			}
		},

		statusModal(id, status){
			this.status_dialog = true;
			this.strategy_id = id;
			this.strategy_status = status;
		},

		async changeStatus(){
			this.loading = true;
			await this.$axios.put(`/api/strategy/status/${this.strategy_id}`, {status:this.strategy_status})
			.then(res => {
				this.loading = false;
				this.strategy_id = '';
				this.strategy_status = '';
				this.status_dialog = false;
				this.Load();
				this.snackColor = 'success';
                this.snackbar = true;
                this.snackText = 'Se actualizó el registro.';
			})
			.catch(error => {
				console.log(error);
				this.loading = false;
				this.strategy_id = '';
				this.strategy_status = '';
				this.status_dialog = false;
				this.snackColor = 'error';
                this.snackbar = true;
                this.snackText = 'No se pudo actualizar el registro.';
			});
		}
	}
};
</script>

