const express = require('express')
const contas = require('./controladores/contas')
const transacoes = require('./controladores/transacoes')


const rotas = express()

rotas.get('/contas', contas.listarContas)
rotas.post('/contas', contas.criarContas)
rotas.put('/contas/:numeroConta/usuario', contas.atualizarUsuarioDaConta)
rotas.delete('/contas/:numeroConta', contas.excluirContas)
rotas.post('/transacoes/depositar', transacoes.depositar)
rotas.post('/transacoes/sacar', transacoes.sacar)
rotas.post('/transacoes/transferir', transacoes.transferir)
rotas.get('/transacoes/saldo', transacoes.saldo)
rotas.get('/contas/extrato', contas.extrato)

module.exports = rotas