const banco = require('../bancodedados')
const {format} = require('date-fns')

function verificaNumeroDaConta (numeroConta){
    const procuraNumeroConta = banco.contas.find(item => item.numero === Number(numeroConta))

    return (procuraNumeroConta) ? true : false
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body
    const index = numero_conta-1

    if (!numero_conta || !valor){
        return res.status(400).json({ mensagem: 'O número da conta e o valor são obrigatórios!' })
    }

    if(!verificaNumeroDaConta(numero_conta)){
        return res.status(404).json({ mensagem: 'o servidor não pode encontrar a conta solicitada' })
    }

    banco.contas[index].saldo += valor

    const data = format(new Date(), 'yyyy/MM/dd kk:mm:ss')

    banco.depositos.push(
        {
            data,
            numero_conta,
            valor
        }
    )
    return res.status(204).send()
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body
    const index = numero_conta-1

    if (!numero_conta || !valor || !senha){
        return res.status(400).json({ mensagem: 'O número da conta, o valor e a senha são obrigatórios!' })
    }

    if(!verificaNumeroDaConta(numero_conta)){
        return res.status(404).json({ mensagem: 'o servidor não pode encontrar a conta solicitada' })
    }

    if(senha !== banco.contas[index].usuario.senha){
        return res.status(400).json({ mensagem: 'A senha inserida está incorreta!' })
    }

    if(valor < 0){
        return res.status(404).json({ mensagem: 'O valor não pode ser menor que zero!' })
    }

    if(banco.contas[index].saldo < valor){
        return res.status(404).json({ mensagem: 'o saldo não é suficiente para este saque' })
    }
    
    banco.contas[index].saldo -= valor

    const data = format(new Date(), 'yyyy/MM/dd kk:mm:ss')

    banco.saques.push(
        {
            data,
            numero_conta,
            valor
        }
    )
    return res.status(204).send()
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body
    const indexOrigem = numero_conta_origem - 1
    const indexDestino = numero_conta_destino - 1 

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha){
        return res.status(400).json({ mensagem: 'Os números das contas de origem e destino, o valor e a senha são obrigatórios!' })
    }

    if(!verificaNumeroDaConta(numero_conta_origem)){
        return res.status(404).json({ mensagem: 'o servidor não pode encontrar a conta de origem' })
    }

    if(!verificaNumeroDaConta(numero_conta_destino)){
        return res.status(404).json({ mensagem: 'o servidor não pode encontrar a conta de destino' })
    }

    if(senha !== banco.contas[indexOrigem].usuario.senha){
        return res.status(400).json({ mensagem: 'A senha inserida está incorreta!' })
    }

    if(banco.contas[indexOrigem].saldo < valor){
        return res.status(404).json({ mensagem: 'saldo insuficiente!' })
    }
    
    banco.contas[indexOrigem].saldo -= valor
    banco.contas[indexDestino].saldo += valor

    const data = format(new Date(), 'yyyy/MM/dd kk:mm:ss')

    banco.transferencias.push(
        {
            data,
            numero_conta_origem,
            numero_conta_destino,
            valor
        }
    )
    return res.status(204).send()
}

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query
    const index = numero_conta - 1

    if (!senha) {
        return res.status(401).json({ mensagem: "É necessário informar a senha da conta!" })
    }

    if (!numero_conta) {
        return res.status(401).json({ mensagem: "É necessário informar o número da conta!" })
    }

    if(!verificaNumeroDaConta(numero_conta)){
        return res.status(404).json({ mensagem: 'conta bancária não encontada!' })
    }

    if (senha !== banco.contas[index].usuario.senha) {
        return res.status(401).json({ mensagem: "A senha informada é inválida!" })
    }

    return res.status(200).json(`saldo: ${banco.contas[index].saldo}`)
}

module.exports = {
    depositar,
    sacar,
    transferir,
    saldo
}