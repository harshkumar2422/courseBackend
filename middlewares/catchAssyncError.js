
export const catchASyncError = ( passedfunc)=>(req,res, next)=>{
    Promise.resolve(passedfunc(req,res, next)).catch(next)
}